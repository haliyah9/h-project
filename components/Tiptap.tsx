"use client";

import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  UnderlineIcon,
} from "lucide-react";

type TiptapProps = {
  content: string;
  onChange: (html: string) => void;
};

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Underline,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
];

const Tiptap = ({ content, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: extensions,
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    title: string;
  }): React.ReactElement => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`cursor-pointer rounded-md p-2 transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-300 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />

        <ToolbarButton
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />

        <ToolbarButton
          title="Align Left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Justify"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />

        <ToolbarButton
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        <EditorContent editor={editor} className="cursor-text" />
      </div>
    </div>
  );
};

export default Tiptap;
