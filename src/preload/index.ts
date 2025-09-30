import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@shared/ipc-channels";
import {
  ShowcaseEchoRequestSchema,
  ShowcaseEchoResponseSchema,
  type ShowcaseEchoRequest,
  type ShowcaseEchoResponse,
} from "@shared/ipc";

const showcase = {
  echo: async (request: ShowcaseEchoRequest): Promise<ShowcaseEchoResponse> => {
    const parsedRequest = ShowcaseEchoRequestSchema.parse(request);
    const rawResponse: unknown = await ipcRenderer.invoke(
      IPC_CHANNELS.SHOWCASE_ECHO,
      parsedRequest,
    );
    return ShowcaseEchoResponseSchema.parse(rawResponse);
  },
};

contextBridge.exposeInMainWorld("electronApi", {
  showcase,
});
