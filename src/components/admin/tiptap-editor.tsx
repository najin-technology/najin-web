"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle, FontSize, Color } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// 어른 친화: px 숫자 대신 한글 라벨. value 빈 문자열 = 기본 크기(스타일 제거).
const FONT_SIZES = [
  { label: "보통", value: "" },
  { label: "크게", value: "20px" },
  { label: "더 크게", value: "24px" },
  { label: "아주 크게", value: "32px" },
];

// 자주 쓰는 색만. value 빈 문자열 = 기본색(상속).
const COLORS = [
  { label: "기본", value: "" },
  { label: "빨강", value: "#DC2626" },
  { label: "파랑", value: "#2563EB" },
  { label: "남색", value: "#1B2A4A" },
  { label: "구리", value: "#B87333" },
];

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} title={title} aria-label={title} className={active ? "bg-brand-navy/10 text-brand-navy hover:bg-brand-navy/15" : "text-gray-700 hover:text-brand-navy"}>
      {children}
    </Button>
  );
}

export function TiptapEditor({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false, // Next SSR 하이드레이션 불일치 방지 (TipTap v3)
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({
        placeholder: placeholder || "내용을 입력하세요...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:ring-inset rounded-b-xl transition-shadow",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const currentSize = (editor.getAttributes("textStyle").fontSize as string) || "";
  const setSize = (value: string) => {
    if (value) editor.chain().focus().setFontSize(value).run();
    else editor.chain().focus().unsetFontSize().run();
  };
  const setTextColor = (value: string) => {
    if (value) editor.chain().focus().setColor(value).run();
    else editor.chain().focus().unsetColor().run();
  };

  const charCount = editor.getText().length;
  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div role="toolbar" aria-label="에디터 도구 모음" className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-gray-200 bg-gray-50/80">
        {/* Text formatting */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게">
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임">
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선">
          <Strikethrough className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 self-center mx-1" />
        {/* Font size */}
        <label className="sr-only" htmlFor="tiptap-font-size">글자 크기</label>
        <select
          id="tiptap-font-size"
          value={currentSize}
          onChange={(e) => setSize(e.target.value)}
          title="글자 크기"
          className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {/* Text color */}
        <div className="flex items-center gap-1 pl-1.5" role="group" aria-label="글자 색">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setTextColor(c.value)}
              title={`글자 색: ${c.label}`}
              aria-label={`글자 색: ${c.label}`}
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-[11px] font-bold hover:ring-2 hover:ring-brand-navy/20 transition-shadow"
              style={c.value ? { backgroundColor: c.value, color: "#fff" } : { backgroundColor: "#fff", color: "#374151" }}
            >
              {c.value ? "" : "가"}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-200 self-center mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목 2">
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목 3">
          <Heading3 className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 self-center mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리 목록">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용">
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 self-center mx-1" />
        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="링크 삽입">
          <LinkIcon className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={addImage} title="이미지 삽입">
          <ImageIcon className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 self-center mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="코드 블록">
          <Code className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
          <Minus className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-200 self-center mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="실행 취소">
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="다시 실행">
          <Redo className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Word/Char count */}
      <div className="px-4 py-1.5 border-t border-gray-200 bg-gray-50 text-[13px] text-gray-600 font-medium tabular-nums">
        {charCount}자 · {wordCount}단어
      </div>
    </div>
  );
}
