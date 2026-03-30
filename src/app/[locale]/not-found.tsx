import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-bold text-[#1B2A4A] mb-4">404</h1>
      <p className="text-[#2D3748] mb-8">
        페이지를 찾을 수 없습니다.
      </p>
      <Link href="/">
        <Button className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
