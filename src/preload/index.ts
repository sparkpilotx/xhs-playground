import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@shared/ipc-channels";
import type { ShowcaseEchoRequest, ShowcaseEchoResponse } from "@shared/ipc";

const showcase = {
  echo: async (request: ShowcaseEchoRequest): Promise<ShowcaseEchoResponse> => {
    const response = (await ipcRenderer.invoke(
      IPC_CHANNELS.SHOWCASE_ECHO,
      request,
    )) as ShowcaseEchoResponse;
    return response;
  },
};

contextBridge.exposeInMainWorld("electronApi", {
  showcase,
});
