import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ShowcaseEchoRequest, ShowcaseEchoResponse } from "@shared/ipc";
import { Send, Loader2 } from "lucide-react";

export function Echo() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEcho = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const request: ShowcaseEchoRequest = { message };
      const res: ShowcaseEchoResponse = await window.electronApi.showcase.echo(request);
      setResponse(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-md">
      <div className="flex w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="echo-message">Message</Label>
        <Input
          id="echo-message"
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          placeholder="Type your message here"
          disabled={loading}
          className="flex-grow"
        />
        <Button
          onClick={() => void handleEcho()}
          disabled={loading}
          className="w-8 h-8 flex-shrink-0"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        </Button>
      </div>
      {response && (
        <div className="text-green-600">
          <strong>Response:</strong> {response}
        </div>
      )}
      {error && (
        <div className="text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
