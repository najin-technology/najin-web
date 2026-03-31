"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryItem {
  src: string;
  title: string;
  category: string;
}

const categories = [
  { key: "all", label: "전체", labelEn: "All" },
  { key: "우레탄", label: "우레탄", labelEn: "Urethane" },
  { key: "합성수지", label: "합성수지", labelEn: "Resin" },
  { key: "CNC", label: "CNC", labelEn: "CNC" },
  { key: "금형", label: "금형", labelEn: "Mold" },
  { key: "EV", label: "EV", labelEn: "EV" },
];

export function PortfolioGallery({
  items,
  locale,
}: {
  items: GalleryItem[];
  locale: string;
}) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

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
              onClick={() => setFilter(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-navy text-white"
                  : "bg-white text-brand-charcoal/70 border border-surface-warm-200 hover:bg-surface-warm-50"
              }`}
            >
              {locale === "ko" ? cat.label : cat.labelEn}
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
                <Image
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
                    {item.category}
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
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
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
                {lightbox.category}
              </span>
              <p className="text-white font-semibold mt-1">{lightbox.title}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
