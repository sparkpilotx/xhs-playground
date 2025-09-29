import type { IpcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "@shared/ipc-channels";
import type { ShowcaseEchoRequest, ShowcaseEchoResponse } from "@shared/ipc";
import { createGeminiClient } from "@utils/gemini";

async function handleEcho(
  _: IpcMainInvokeEvent,
  request: ShowcaseEchoRequest,
): Promise<ShowcaseEchoResponse> {
  const gemini = createGeminiClient();

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
      return {
        message: generated,
      } satisfies ShowcaseEchoResponse;
    }
  } catch (error) {
    console.error("Failed to generate Gemini echo response", error);
  }

  return {
    message: `Hello, ${request.message}!`,
  } satisfies ShowcaseEchoResponse;
}

export function registerShowcaseServices(ipcMain: IpcMain): void {
  ipcMain.handle(IPC_CHANNELS.SHOWCASE_ECHO, handleEcho);
}

export function unregisterShowcaseServices(ipcMain: IpcMain): void {
  ipcMain.removeHandler(IPC_CHANNELS.SHOWCASE_ECHO);
}
