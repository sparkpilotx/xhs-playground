import type { ShowcaseEchoRequest, ShowcaseEchoResponse } from "@shared/ipc";

declare global {
  interface ShowcaseApi {
    echo: (request: ShowcaseEchoRequest) => Promise<ShowcaseEchoResponse>;
  }

  interface ElectronApi {
    showcase: ShowcaseApi;
  }

  interface Window {
    electronApi: ElectronApi;
  }
}

export {};
