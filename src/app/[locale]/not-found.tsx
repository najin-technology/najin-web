import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-bold text-brand-navy mb-4">404</h1>
      <p className="text-brand-charcoal mb-8">
        페이지를 찾을 수 없습니다.
      </p>
      <Link href="/">
        <Button className="bg-brand-blue hover:bg-brand-blue-hover text-white">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
