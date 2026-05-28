"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useRef } from "react";

type Props = {
  onToken: (token: string) => void;
  name?: string;
};

// Build-time inlined. Read once at module scope so the value is embedded in the
// client bundle even when the component tree-shakes; trimmed defensively because
// env injection can append a trailing newline that Turnstile rejects as "Invalid input".
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

export function TurnstileWidget({ onToken, name = "turnstileToken" }: Props) {
  const siteKey = SITE_KEY;
  const inputRef = useRef<HTMLInputElement>(null);

  if (!siteKey) return null;

  return (
    <>
      <input ref={inputRef} type="hidden" name={name} />
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => {
          if (inputRef.current) inputRef.current.value = token;
          onToken(token);
        }}
        options={{ appearance: "interaction-only", theme: "auto", size: "normal" }}
      />
    </>
  );
}
