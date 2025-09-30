import type { IpcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "@shared/ipc-channels";
import {
  ShowcaseEchoRequestSchema,
  ShowcaseEchoResponseSchema,
  type ShowcaseEchoResponse,
} from "@shared/ipc";
import { createGeminiClient } from "@utils/gemini";
import type { GoogleGenAI } from "@google/genai";
import type { LLM } from "@lmstudio/sdk";
import { Chat } from "@lmstudio/sdk";

import { createGptOssClient } from "@utils/gpt-oss";

let gemini: GoogleGenAI | null = null;
let gptOss: LLM | null = null;

const SYSTEM_PROMPT =
  "You are a concise, upbeat assistant. Craft a short acknowledgement that references the user's message.";
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GPT_FINAL_MESSAGE_MARKER = "<|channel|>final<|message|>";

function formatEchoResponse(message: string): ShowcaseEchoResponse {
  return ShowcaseEchoResponseSchema.parse({
    message,
  });
}

function buildFallbackResponse(userMessage: string): ShowcaseEchoResponse {
  return formatEchoResponse(`Hello, ${userMessage}!`);
}

function ensureGeminiClient(): GoogleGenAI | null {
  if (!gemini) {
    gemini = createGeminiClient();
  }

  return gemini;
}

async function ensureGptOssClient(): Promise<LLM | null> {
  if (!gptOss) {
    gptOss = await createGptOssClient();
  }

  return gptOss;
}

async function tryGenerateWithGemini(message: string): Promise<string | null> {
  const client = ensureGeminiClient();
  if (!client) {
    return null;
  }

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 100,
        responseMimeType: "text/plain",
        systemInstruction: SYSTEM_PROMPT,
      },
      contents: message,
    });

    const generated = response.text?.trim();
    return generated || null;
  } catch (error) {
    console.error("Failed to generate Gemini echo response", error);
    return null;
  }
}

async function tryGenerateWithGptOss(message: string): Promise<string | null> {
  const client = await ensureGptOssClient();
  if (!client) {
    return null;
  }

  const chat = Chat.empty();
  chat.append("system", SYSTEM_PROMPT);
  chat.append("user", message);

  try {
    const response = await client.respond(chat);
    const rawResponse = response.content;
    const finalMessageIndex = rawResponse.indexOf(GPT_FINAL_MESSAGE_MARKER);

    if (finalMessageIndex !== -1) {
      const generated = rawResponse
        .substring(finalMessageIndex + GPT_FINAL_MESSAGE_MARKER.length)
        .trim();
      return generated || null;
    }

    const generated = rawResponse.trim();
    return generated || null;
  } catch (error) {
    console.error("Failed to generate GPT OSS echo response", error);
    return null;
  }
}

async function handleEcho(
  _: IpcMainInvokeEvent,
  rawRequest: unknown,
): Promise<ShowcaseEchoResponse> {
  const request = ShowcaseEchoRequestSchema.parse(rawRequest);
  const generatedMessage =
    (await tryGenerateWithGemini(request.message)) ??
    (await tryGenerateWithGptOss(request.message));

  if (generatedMessage) {
    return formatEchoResponse(generatedMessage);
  }

  return buildFallbackResponse(request.message);
}

export function registerShowcaseServices(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SHOWCASE_ECHO, handleEcho);
}

export function unregisterShowcaseServices(ipcMain: IpcMain): void {
  ipcMain.removeHandler(IPC_CHANNELS.SHOWCASE_ECHO);
}
