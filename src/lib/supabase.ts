import { createClient } from "@supabase/supabase-js";

// Build context (특히 preview env 미설정 시) 에서도 client 가 항상 생성되도록 placeholder fallback.
// 실제 호출은 try/catch (queries.ts) 또는 unstable_cache 의 throw 격리로 처리.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
