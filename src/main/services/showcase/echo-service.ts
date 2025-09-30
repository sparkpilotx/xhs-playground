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

async function handleEcho(
  _: IpcMainInvokeEvent,
  rawRequest: unknown,
): Promise<ShowcaseEchoResponse> {
  const request = ShowcaseEchoRequestSchema.parse(rawRequest);
  if (!gemini) {
    gemini = createGeminiClient();
  }

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash-lite",
        config: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 100,
          responseMimeType: "text/plain",
          systemInstruction:
            "You are a concise, upbeat assistant. Craft a short acknowledgement that references the user's message.",
        },
        contents: request.message,
      });

      const generated = response.text?.trim();
      if (generated) {
        return ShowcaseEchoResponseSchema.parse({
          message: generated,
        });
      }
    } catch (error) {
      console.error("Failed to generate Gemini echo response", error);
    }
  }

  if (!gptOss) {
    gptOss = await createGptOssClient();
  }

  if (gptOss) {
    const chat = Chat.empty();
    chat.append(
      "system",
      "You are a concise, upbeat assistant. Craft a short acknowledgement that references the user's message.",
    );
    chat.append("user", request.message);

    try {
      const response = await gptOss.respond(chat);
      const rawResponse = response.content;
      const finalMessageMarker = "<|channel|>final<|message|>";
      const finalMessageIndex = rawResponse.indexOf(finalMessageMarker);

      if (finalMessageIndex !== -1) {
        const generated = rawResponse
          .substring(finalMessageIndex + finalMessageMarker.length)
          .trim();
        if (generated) {
          return ShowcaseEchoResponseSchema.parse({
            message: generated,
          });
        }
      } else {
        // Fallback for non-harmony responses
        const generated = rawResponse.trim();
        if (generated) {
          return ShowcaseEchoResponseSchema.parse({
            message: generated,
          });
        }
      }
    } catch (error) {
      console.error("Failed to generate GPT OSS echo response", error);
    }
  }

  return ShowcaseEchoResponseSchema.parse({
    message: `Hello, ${request.message}!`,
  });
}

export function registerShowcaseServices(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SHOWCASE_ECHO, handleEcho);
}

export function unregisterShowcaseServices(ipcMain: IpcMain): void {
  ipcMain.removeHandler(IPC_CHANNELS.SHOWCASE_ECHO);
}
