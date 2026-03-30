import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "../product-form";

export const metadata = { title: "제품 등록" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">새 제품 등록</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
