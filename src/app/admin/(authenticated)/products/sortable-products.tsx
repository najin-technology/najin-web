"use client";

import Link from "next/link";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Package, Pencil } from "lucide-react";
import { ProductActiveToggle } from "./product-toggle";
import { ProductDeleteButton } from "./product-delete-button";
import { reorderProducts } from "./actions";

type Product = {
  id: string;
  name_ko: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export function SortableProductTable({ items }: { items: Product[] }) {
  return (
    <SortableList
      items={items}
      onReorder={async (ids) => await reorderProducts(ids)}
      renderItem={(p, dragHandle) => (
        <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50/50 group">
          {dragHandle}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-gray-300" />
            </div>
            <span className="font-medium text-sm truncate">{p.name_ko}</span>
          </div>
          <ProductActiveToggle productId={p.id} isActive={p.is_active} />
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link href={`/admin/products/${p.id}/edit`}>
              <Button variant="ghost" size="icon-sm" aria-label="편집">
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>
            <ProductDeleteButton productId={p.id} />
          </div>
        </div>
      )}
    />
  );
}
