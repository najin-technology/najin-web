import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { sessionHash, isBot } from "@/lib/analytics/classify";

type EventPayload = {
  field?: string;
  action?: string;
};

const ALLOWED_ACTIONS = new Set(["focus", "fill", "blur_empty", "submit", "abandon"]);
const MAX_FIELD_LEN = 64;

export async function POST(request: NextRequest) {
  let body: EventPayload;
  try {
    body = (await request.json()) as EventPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const field = typeof body.field === "string" ? body.field.slice(0, MAX_FIELD_LEN) : null;
  const action = typeof body.action === "string" ? body.action : null;
  if (!field || !action || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const session = sessionHash(ip, userAgent);

  supabase
    .from("quote_form_events")
    .insert({ session_hash: session, field, action })
    .then(({ error }) => {
      if (error) console.warn("[form-event] insert failed", error.message);
    });

  return NextResponse.json({ ok: true });
}
