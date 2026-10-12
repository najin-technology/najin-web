"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageFade } from "@/components/image-fade";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface GalleryItem {
  src: string;
  title: string;
  category: string;
}

const categories = [
  { key: "all", labelKey: "all" },
  { key: "우레탄", labelKey: "urethane" },
  { key: "합성수지", labelKey: "resin" },
  { key: "CNC", labelKey: "cnc" },
  { key: "금형", labelKey: "mold" },
  { key: "EV", labelKey: "ev" },
];

export function PortfolioGallery({
  items,
}: {
  items: GalleryItem[];
}) {
  const t = useTranslations("portfolio.gallery");
  const categoryLabels = t.raw("categories") as Record<string, string>;
  const categoryLabel = (category: string) => categoryLabels[category] || category;
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 예전엔 그냥 div 오버레이라 Esc 로 못 닫고, 포커스가 뒤 페이지에 남아
  // 탭하면 라이트박스 뒤 링크들로 새어나갔고, 닫아도 포커스가 돌아오지 않았다.
  // <dialog>.showModal() 은 Esc 닫기 · 포커스 트랩 · 포커스 복귀 · 배경 inert 를
  // 브라우저가 전부 처리한다. 직접 구현할 이유가 없다.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (lightbox && !d.open) d.showModal();
    else if (!lightbox && d.open) d.close();
  }, [lightbox]);

  const filtered =
    filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8" data-animate="fade-up">
        {categories.map((cat) => {
          const isActive = filter === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-brand-navy text-white"
                  : "bg-white text-brand-charcoal/85 border border-surface-warm-200 hover:bg-surface-warm-50 hover:text-brand-navy"
              }`}
            >
              {t(`filters.${cat.labelKey}`)}
            </button>
          );
        })}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((item, i) => {
          const isLarge = i < 2 && filter === "all";
          return (
            <button
              key={`${item.src}-${i}`}
              type="button"
              aria-label={t("viewImage", { title: item.title })}
              onClick={() => setLightbox(item)}
              className={`group bg-white rounded-xl overflow-hidden border border-surface-warm-200 hover-lift text-left ${
                isLarge ? "md:col-span-2 md:row-span-2" : ""
              }`}
              data-animate="fade-up"
              data-animate-delay={String(Math.min((i % 4) + 1, 4))}
            >
              <div
                className={`relative overflow-hidden ${
                  isLarge ? "aspect-[4/3]" : "aspect-square"
                }`}
              >
                <ImageFade
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes={
                    isLarge
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 50vw, 25vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:from-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 md:translate-y-full md:group-hover:translate-y-0 transition-transform">
                  <span className="inline-block text-[10px] md:text-xs font-medium text-white bg-brand-copper px-1.5 py-0.5 rounded-full">
                    {categoryLabel(item.category)}
                  </span>
                  <p
                    className={`font-medium text-white mt-0.5 ${
                      isLarge
                        ? "text-sm md:text-base"
                        : "text-xs md:text-sm"
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {/* ref 를 잡아야 해서 dialog 자체는 항상 렌더하고 내용만 조건부로 둔다. */}
      <dialog
        ref={dialogRef}
        aria-label={lightbox ? t("viewImage", { title: lightbox.title }) : undefined}
        // Esc 로 닫힐 때도 이 핸들러가 불려서 state 가 항상 DOM 과 동기화된다.
        onClose={() => setLightbox(null)}
        // 백드롭(=dialog 자기 영역) 클릭으로 닫기. 내부 div 는 stopPropagation.
        onClick={() => setLightbox(null)}
        className="m-0 max-w-none max-h-none w-full h-full bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {lightbox && (
          <div className="w-full h-full flex items-center justify-center">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
              aria-label={t("closeImage")}
            >
              <X className="w-8 h-8" />
            </button>
            <div
              className="relative max-w-4xl w-full max-h-[85vh] rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.title}
                width={1200}
                height={900}
                className="w-full h-auto max-h-[80vh] object-contain bg-white rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                <span className="text-xs font-medium text-white bg-brand-copper px-2 py-0.5 rounded-full">
                  {categoryLabel(lightbox.category)}
                </span>
                <p className="text-white font-semibold mt-1">{lightbox.title}</p>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
