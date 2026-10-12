"use client";

import { DEFAULT_SCRIPT_ID, Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onToken: (token: string) => void;
  name?: string;
  locale?: string;
};

const messages = {
  ko: {
    error: "보안 인증을 완료하지 못했습니다. 연결을 확인하고 다시 시도해주세요.",
    expired: "보안 인증이 만료되었습니다. 다시 인증해주세요.",
    unsupported: "이 브라우저에서는 보안 인증을 진행할 수 없습니다. 최신 브라우저를 사용해주세요.",
    retry: "보안 인증 다시 시도",
  },
  en: {
    error: "Security verification could not complete. Check your connection and try again.",
    expired: "Security verification expired. Please verify again.",
    unsupported: "This browser cannot complete security verification. Please use an up-to-date browser.",
    retry: "Retry security verification",
  },
  zh: {
    error: "安全验证未能完成。请检查网络连接后重试。",
    expired: "安全验证已过期，请重新验证。",
    unsupported: "此浏览器无法完成安全验证，请使用最新版本的浏览器。",
    retry: "重新进行安全验证",
  },
};

type Failure = "error" | "expired" | "unsupported";

// Build-time inlined. Read once at module scope so the value is embedded in the
// client bundle even when the component tree-shakes; trimmed defensively because
// env injection can append a trailing newline that Turnstile rejects as "Invalid input".
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

function hasFailedScript() {
  return typeof window !== "undefined" && !window.turnstile &&
    document.getElementById(DEFAULT_SCRIPT_ID)?.dataset.turnstileLoadState === "failed";
}

export function TurnstileWidget({ onToken, name = "turnstileToken", locale = "ko" }: Props) {
  const siteKey = SITE_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<TurnstileInstance>(null);
  // The shared script outlives this component during client-side navigation.
  // Read its failure marker when a form mounts again, rather than losing the
  // retry UI together with the previous component's state.
  const [failure, setFailure] = useState<Failure | null>(() =>
    hasFailedScript() ? "error" : null
  );
  const [attempt, setAttempt] = useState(0);
  const text = messages[locale === "en" || locale === "zh" ? locale : "ko"];

  const updateToken = useCallback((token: string) => {
    if (inputRef.current) inputRef.current.value = token;
    onToken(token);
  }, [onToken]);

  const invalidate = useCallback((reason: Failure) => {
    updateToken("");
    setFailure(reason);
  }, [updateToken]);

  useEffect(() => {
    if (!siteKey) return;
    let script: HTMLElement | null = null;
    const handleError = () => invalidate("error");
    const watchScript = () => {
      const nextScript = document.getElementById(DEFAULT_SCRIPT_ID);
      if (script === nextScript) return;
      script?.removeEventListener("error", handleError);
      script = nextScript;
      if (!script) return;
      if (!script.dataset.turnstileLoadState) {
        // Keep this marker listener with the script even when the form leaves.
        // An in-flight request may fail while no widget component is mounted.
        const trackedScript = script;
        trackedScript.dataset.turnstileLoadState = "loading";
        trackedScript.addEventListener("error", () => {
          trackedScript.dataset.turnstileLoadState = "failed";
        }, { once: true });
      }
      script.addEventListener("error", handleError);
    };
    const observer = new MutationObserver(watchScript);
    observer.observe(document.head, { childList: true });
    watchScript();
    return () => {
      observer.disconnect();
      script?.removeEventListener("error", handleError);
    };
  }, [attempt, invalidate, siteKey]);

  function retry() {
    updateToken("");
    setFailure(null);
    if (hasFailedScript()) {
      // A failed script remains in the DOM, so the library will not inject it
      // again until it is removed. Remount only the widget, preserving the form.
      document.getElementById(DEFAULT_SCRIPT_ID)?.remove();
      setAttempt((n) => n + 1);
    } else {
      widgetRef.current?.reset();
    }
  }

  if (!siteKey) return null;

  return (
    <>
      <input ref={inputRef} type="hidden" name={name} />
      <Turnstile
        key={attempt}
        ref={widgetRef}
        siteKey={siteKey}
        onSuccess={(token) => {
          updateToken(token);
          setFailure(null);
        }}
        onExpire={() => invalidate("expired")}
        onError={() => invalidate("error")}
        onTimeout={() => invalidate("error")}
        onUnsupported={() => invalidate("unsupported")}
        options={{ appearance: "interaction-only", theme: "auto", size: "compact", language: locale, responseField: false }}
      />
      {failure && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{text[failure]}</p>
          <button type="button" onClick={retry} className="mt-2 min-h-11 font-semibold underline underline-offset-4">
            {text.retry}
          </button>
        </div>
      )}
    </>
  );
}
