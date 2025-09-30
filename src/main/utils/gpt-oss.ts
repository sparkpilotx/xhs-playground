import { LMStudioClient } from "@lmstudio/sdk";
import type { LLM } from "@lmstudio/sdk";

let loadedModel: LLM | null = null;

export async function createGptOssClient(): Promise<LLM | null> {
  if (loadedModel) {
    return loadedModel;
  }

  try {
    const client = new LMStudioClient({
      baseUrl: "ws://127.0.0.1:1234",
    });

    const loaded = await client.llm.listLoaded();
    const existing = loaded.find((m) => m.path === "openai/gpt-oss-20b");

    if (existing) {
      loadedModel = existing;
      return loadedModel;
    }

    const model = await client.llm.load("openai/gpt-oss-20b");
    loadedModel = model;
    return loadedModel;
  } catch (error) {
    console.error("Failed to create GPT OSS client for model 'openai/gpt-oss-20b'", error);
    return null;
  }
}
