"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ];
  return "\uFEFF" + lines.join("\n"); // BOM for Korean Excel compat
}

export function CsvExportButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: string[][];
}) {
  const handleExport = () => {
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!rows.length) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1.5 text-gray-600"
    >
      <Download className="w-3.5 h-3.5" />
      CSV
    </Button>
  );
}
