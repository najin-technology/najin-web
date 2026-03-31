"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
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
    extensions: [
      StarterKit,
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
          "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none",
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

  const charCount = editor.getText().length;
  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  const ToolBtn = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} title={title} aria-label={title} className={active ? "bg-gray-200" : ""}>
      {children}
    </Button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-gray-200 bg-gray-50/80">
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
        <div className="w-px h-5 bg-gray-300 self-center mx-0.5" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목 2">
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목 3">
          <Heading3 className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-300 self-center mx-0.5" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리 목록">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용">
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-300 self-center mx-0.5" />
        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="링크 삽입">
          <LinkIcon className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={addImage} title="이미지 삽입">
          <ImageIcon className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-300 self-center mx-0.5" />
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="코드 블록">
          <Code className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
          <Minus className="w-4 h-4" />
        </ToolBtn>
        <div className="w-px h-5 bg-gray-300 self-center mx-0.5" />
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
      <div className="px-4 py-1.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400">
        {charCount}자 · {wordCount}단어
      </div>
    </div>
  );
}
