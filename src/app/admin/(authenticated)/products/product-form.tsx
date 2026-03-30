"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X } from "lucide-react";

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={(checked: boolean) => setIsActive(checked)}
        />
        <Label>{isActive ? "활성" : "비활성"}</Label>
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

      <Tabs defaultValue="ko">
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

      {/* Image Management */}
      <div className="space-y-3">
        <Label>제품 이미지</Label>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((url) => (
              <div
                key={url}
                className="relative group w-24 h-24 rounded-lg border border-gray-200 overflow-hidden"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New image upload */}
        <Input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="max-w-sm"
        />
        <p className="text-xs text-gray-500">
          여러 이미지를 선택할 수 있습니다.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#1B2A4A] hover:bg-[#2D3748] text-white"
        >
          {pending
            ? "저장 중..."
            : mode === "create"
              ? "등록"
              : "수정"}
        </Button>
      </div>
    </form>
  );
}
