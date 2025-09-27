export const IPC_CHANNELS = {
  SHOWCASE_ECHO: "showcase:ipc:invoke:echo",
} as const;

export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
