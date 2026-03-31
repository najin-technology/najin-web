import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-lg font-bold text-brand-navy mb-1">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link href="/admin">
        <Button className="bg-brand-navy hover:bg-brand-navy-light text-white gap-1.5">
          <Home className="w-4 h-4" />
          대시보드로 이동
        </Button>
      </Link>
    </div>
  );
}
