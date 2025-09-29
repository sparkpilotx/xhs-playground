import type { IpcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "@shared/ipc-channels";
import type { ShowcaseEchoRequest, ShowcaseEchoResponse } from "@shared/ipc";

async function handleEcho(
  _: IpcMainInvokeEvent,
  request: ShowcaseEchoRequest,
): Promise<ShowcaseEchoResponse> {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a 5-second delay
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
