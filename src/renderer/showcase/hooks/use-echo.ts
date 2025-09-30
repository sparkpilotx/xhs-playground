import { useCallback, useState } from "react";
import { ShowcaseEchoRequestSchema } from "@shared/ipc";
import { echoService } from "@/showcase/lib/echo-service";

export function useEcho() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      ShowcaseEchoRequestSchema.parse({ message });
      const echoed = await echoService.echoMessage(message);
      setResponse(echoed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [message, loading]);

  return {
    message,
    setMessage,
    response,
    loading,
    error,
    send,
  };
}
