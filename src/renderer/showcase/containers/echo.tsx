import { useEcho } from "@/showcase/hooks/use-echo";
import { EchoView } from "@/showcase/components/echo-view";
import type React from "react";

export function Echo(): React.JSX.Element {
  const { message, setMessage, response, loading, error, send } = useEcho();

  return (
    <EchoView
      message={message}
      onMessageChange={setMessage}
      onSend={() => void send()}
      loading={loading}
      response={response}
      error={error}
    />
  );
}
