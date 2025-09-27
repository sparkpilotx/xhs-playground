import { z } from "zod";

export const ShowcaseEchoRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});
export type ShowcaseEchoRequest = z.infer<typeof ShowcaseEchoRequestSchema>;

export const ShowcaseEchoResponseSchema = z.object({
  message: z.string(),
});
export type ShowcaseEchoResponse = z.infer<typeof ShowcaseEchoResponseSchema>;
