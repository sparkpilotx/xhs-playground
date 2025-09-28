import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import type React from "react";

export interface EchoViewProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  response: string | null;
  error: string | null;
}

export function EchoView({
  message,
  onMessageChange,
  onSend,
  loading,
  response,
  error,
}: EchoViewProps) {
  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-md">
      <div className="flex w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="echo-message">Message</Label>
        <Input
          id="echo-message"
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMessageChange(e.target.value)}
          placeholder="Type your message here"
          disabled={loading}
          className="flex-grow"
        />
        <Button onClick={onSend} disabled={loading} className="w-8 h-8 flex-shrink-0">
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
