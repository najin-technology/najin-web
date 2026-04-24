"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useRef } from "react";

type Props = {
  onToken: (token: string) => void;
  name?: string;
};

export function TurnstileWidget({ onToken, name = "turnstileToken" }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
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
