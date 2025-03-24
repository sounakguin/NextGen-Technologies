"use client";

import React, { useEffect, useState } from "react";
import {
  EditorContent,
  useEditor,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Image as TiptapImage } from "@tiptap/extension-image";
import NextImage from "next/image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  X,
  Link as LinkIcon,
} from "lucide-react";
import createClient from "@/utils/supabase/client";

// --- Types for Tiptap document structure ---
interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
}

interface TiptapDoc extends TiptapNode {
  type: "doc";
  content: TiptapNode[];
}

// --- Types for Draft.js conversion ---
interface DraftEntity {
  type: string;
  data: { src?: string; url?: string };
}
interface DraftEntityMap {
  [key: string]: DraftEntity;
}
interface EntityRange {
  key: string;
  offset: number;
  length: number;
}
interface DraftBlock {
  type: string;
  text?: string;
  entityRanges?: EntityRange[];
}
interface DraftRaw {
  blocks: DraftBlock[];
  entityMap: DraftEntityMap;
}

// ------------------------------------------------------------------
// 1) A custom React NodeView for images with a delete button in editable mode
const ImageNode: React.FC<NodeViewProps> = (props) => {
  const { node, getPos, editor } = props;
  const { src } = node.attrs;

  const handleDelete = () => {
    const pos = getPos();
    editor.commands.deleteRange({
      from: pos,
      to: pos + (node.nodeSize || 0),
    });
  };

  return (
    <NodeViewWrapper className="relative inline-block group">
      <NextImage
        src={src || "/placeholder.svg"}
        alt="Rich Text Image"
        width={300}
        height={200}
        className="max-w-full h-auto"
      />
      {editor.isEditable && (
        <button
          type="button"
          onClick={handleDelete}
          title="Remove image"
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <X size={16} className="text-gray-600" />
        </button>
      )}
    </NodeViewWrapper>
  );
};

// ------------------------------------------------------------------
// 2) Extend Tiptap's Image extension to use our custom NodeView
const CustomImage = TiptapImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },
});

// ------------------------------------------------------------------
// 3) A minimal Draft→Tiptap converter
function convertDraftToTiptap(draftRaw: DraftRaw): TiptapDoc {
  const doc: TiptapDoc = { type: "doc", content: [] };

  draftRaw.blocks.forEach((block: DraftBlock) => {
    // 3a) "atomic" => image
    if (block.type === "atomic") {
      const eRanges = block.entityRanges || [];
      if (eRanges.length) {
        const entityKey = eRanges[0].key;
        const entity = draftRaw.entityMap[entityKey];
        if (entity?.type === "IMAGE") {
          doc.content.push({
            type: "image",
            attrs: { src: entity.data.src },
          });
        }
      }
      return;
    }

    // 3b) Unstyled => paragraphs, splitting on "\n"
    if (block.type === "unstyled") {
      const text = block.text || "";
      const lines = text.split("\n");
      if (!block.entityRanges?.length) {
        lines.forEach((line: string) => {
          doc.content.push({
            type: "paragraph",
            content: line
              ? [
                  {
                    type: "text",
                    text: line,
                  },
                ]
              : [],
          });
        });
      } else {
        const combined = lines.join(" ");
        doc.content.push(
          convertUnstyledWithEntities(
            combined,
            block.entityRanges,
            draftRaw.entityMap
          )
        );
      }
      return;
    }

    // 3c) Fallback => also split on "\n"
    const fallbackLines = (block.text || "").split("\n");
    fallbackLines.forEach((line: string) => {
      doc.content.push({
        type: "paragraph",
        content: line
          ? [
              {
                type: "text",
                text: line,
              },
            ]
          : [],
      });
    });
  });

  return doc;
}

/**
 * For unstyled blocks with link entities; returns a paragraph node.
 */
function convertUnstyledWithEntities(
  text: string,
  entityRanges: EntityRange[],
  entityMap: DraftEntityMap
): TiptapNode {
  const content: TiptapNode[] = [];
  let lastOffset = 0;
  entityRanges.sort((a: EntityRange, b: EntityRange) => a.offset - b.offset);

  entityRanges.forEach((range: EntityRange) => {
    const e = entityMap[range.key];
    const start = range.offset;
    const end = start + range.length;

    if (start > lastOffset) {
      content.push({
        type: "text",
        text: text.slice(lastOffset, start),
      });
    }
    const segment = text.slice(start, end);
    if (e?.type === "LINK") {
      content.push({
        type: "text",
        text: segment,
        marks: [
          {
            type: "link",
            attrs: { href: e.data.url },
          },
        ],
      });
    } else {
      content.push({
        type: "text",
        text: segment,
      });
    }
    lastOffset = end;
  });

  if (lastOffset < text.length) {
    content.push({
      type: "text",
      text: text.slice(lastOffset),
    });
  }

  return { type: "paragraph", content };
}

// ------------------------------------------------------------------
// 4) parseInitialContent
function parseInitialContent(jsonString: string): TiptapDoc {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.blocks && parsed.entityMap !== undefined) {
      return convertDraftToTiptap(parsed);
    }
    return parsed;
  } catch {
    return { type: "doc", content: [] };
  }
}

// ------------------------------------------------------------------
// 5) Main Editor Component
interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = "",
  onChange,
  readOnly = false,
}) => {
  // ...existing code...
  const [localContent, setLocalContent] = useState<string>(initialContent);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc pl-5" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-5" } },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      CustomImage,
    ],
    content: parseInitialContent(localContent),
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const updated = JSON.stringify(editor.getJSON());
      setLocalContent(updated);
      onChange?.(updated);
    },
  });

  useEffect(() => {
    if (initialContent && initialContent !== localContent) {
      setLocalContent(initialContent);
      editor?.commands.setContent(parseInitialContent(initialContent));
    }
  }, [initialContent, localContent, editor]);

  if (!editor) return null;

  const handleImageUpload = async (file: File) => {
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `Blogs/${fileName}`;

      const { error } = await supabase.storage
        .from("Images")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;

      const publicUrl = supabase.storage.from("Images").getPublicUrl(filePath)
        .data.publicUrl;

      editor.chain().focus().setImage({ src: publicUrl, alt: "" }).run();
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <div className="min-h-[200px] border rounded-md">
      {/* ...existing toolbar and editor code... */}
      {!readOnly && (
        <div className="toolbar flex gap-4 mb-2 border p-2 ">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-icon px-3 py-2 rounded-md ${
              editor.isActive("bold") ? "bg-gray-300" : "hover:bg-gray-300"
            }`}
          >
            <Bold size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-icon px-3 py-2 rounded-md ${
              editor.isActive("italic") ? "bg-gray-300" : "hover:bg-gray-300"
            }`}
          >
            <Italic size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-icon px-3 py-2 rounded-md ${
              editor.isActive("underline") ? "bg-gray-300" : "hover:bg-gray-300"
            }`}
          >
            <UnderlineIcon size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-icon px-3 py-2 rounded-md ${
              editor.isActive("bulletList")
                ? "bg-gray-300"
                : "hover:bg-gray-300"
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-icon px-3 py-2 rounded-md ${
              editor.isActive("orderedList")
                ? "bg-gray-300"
                : "hover:bg-gray-300"
            }`}
          >
            <ListOrdered size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-icon px-3 py-2 rounded-md hover:bg-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-icon px-3 py-2 rounded-md hover:bg-gray-300"
          >
            <ChevronRight size={20} />
          </button>
          <label className="toolbar-icon px-3 py-2 rounded-md hover:bg-gray-300 cursor-pointer">
            <ImageIcon size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageInputChange}
            />
          </label>
          <button
            onClick={addLink}
            className="toolbar-icon px-3 py-2 rounded-md hover:bg-gray-300"
          >
            <LinkIcon size={20} />
          </button>
        </div>
      )}
      <div className="p-5">
        <EditorContent
          editor={editor}
          className={readOnly ? "prose max-w-none" : ""}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
