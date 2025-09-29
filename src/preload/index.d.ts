import type { ShowcaseEchoRequest, ShowcaseEchoResponse } from "@shared/ipc";

declare global {
  interface Window {
    electronApi: {
      showcase: {
        echo: (request: ShowcaseEchoRequest) => Promise<ShowcaseEchoResponse>;
      };
    };
  }
}
