"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertMessage } from "@/components/admin/alert-message";
import { FormStatusBar } from "@/components/admin/form-status-bar";
import { Upload, X } from "lucide-react";

const CATEGORIES = [
  { value: "우레탄", label: "우레탄" },
  { value: "합성수지", label: "합성수지" },
  { value: "CNC", label: "CNC" },
  { value: "금형", label: "금형" },
  { value: "EV", label: "EV" },
];

type ProductData = {
  id?: string;
  name_ko: string;
  name_en: string | null;
  description_ko: string | null;
  description_en: string | null;
  category: string;
  image_urls: string[] | null;
  sort_order: number;
  is_active: boolean;
};

export function ProductForm({
  product,
  mode,
}: {
  product?: ProductData;
  mode: "create" | "edit";
}) {
  const action = mode === "create" ? createProduct : updateProduct;
  const [state, formAction, pending] = useActionState(action, {});
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.image_urls || []
  );

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  return (
    <form action={formAction} className="space-y-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="is_active" value={String(isActive)} />
      <input
        type="hidden"
        name="existing_image_urls"
        value={JSON.stringify(existingImages)}
      />

      {state.error && (
        <AlertMessage>{state.error}</AlertMessage>
      )}

      <FormStatusBar checked={isActive} onCheckedChange={setIsActive} />

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">기본 정보</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>카테고리 *</Label>
          <Select name="category" defaultValue={product?.category || ""} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort_order">정렬순서</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={product?.sort_order ?? 0}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">콘텐츠</p>
      </div>

      <Tabs defaultValue="ko" onValueChange={(v) => {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("tab", v);
          window.history.replaceState({}, "", url.toString());
        }
      }}>
        <TabsList>
          <TabsTrigger value="ko">한국어</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>

        <TabsContent value="ko" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name_ko">제품명 (한국어) *</Label>
            <Input
              id="name_ko"
              name="name_ko"
              defaultValue={product?.name_ko || ""}
              required
              placeholder="제품명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ko">설명 (한국어)</Label>
            <Textarea
              id="description_ko"
              name="description_ko"
              defaultValue={product?.description_ko || ""}
              placeholder="제품 설명을 입력하세요"
              rows={6}
            />
          </div>
        </TabsContent>

        <TabsContent value="en" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name_en">Product Name (English)</Label>
            <Input
              id="name_en"
              name="name_en"
              defaultValue={product?.name_en || ""}
              placeholder="Enter product name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">Description (English)</Label>
            <Textarea
              id="description_en"
              name="description_en"
              defaultValue={product?.description_en || ""}
              placeholder="Enter product description"
              rows={6}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t border-gray-100 pt-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">미디어</p>
      </div>

      {/* Image Management */}
      <div className="space-y-3">
        <Label>제품 이미지</Label>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((url) => (
              <div
                key={url}
                className="relative group w-24 h-24 rounded-xl border border-gray-200 overflow-hidden"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New image upload */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-navy/30 hover:bg-gray-50/50 transition-colors">
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">이미지를 드래그하거나 클릭하여 업로드</p>
          <p className="text-xs text-gray-400 mb-3">JPG, PNG, WebP (최대 5MB)</p>
          <Input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="max-w-sm mx-auto"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm min-w-[100px]"
        >
          {pending
            ? "저장 중..."
            : mode === "create"
              ? "등록하기"
              : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
