import {
  ShowcaseEchoResponseSchema,
  type ShowcaseEchoRequest,
  type ShowcaseEchoResponse,
} from "@shared/ipc";

export const echoService = {
  async echoMessage(message: string): Promise<string> {
    const request: ShowcaseEchoRequest = { message };
    const response: ShowcaseEchoResponse = await window.electronApi.showcase.echo(request);
    const parsed = ShowcaseEchoResponseSchema.parse(response);
    return parsed.message;
  },
};
