import { runHealthChecks } from "@/lib/health";

// 수동/외부 모니터링용 헬스 엔드포인트. 비밀 없음(상태 boolean만).
// criticalDown(=DB/KV 장애)이면 503 → 업타임 모니터가 감지. 설정 경고는 200 유지.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runHealthChecks();
  return Response.json(result, { status: result.criticalDown ? 503 : 200 });
}
