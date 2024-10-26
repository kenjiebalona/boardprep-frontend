import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import ListItem from '@tiptap/extension-list-item';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import {
    BubbleMenu,
    EditorContent,
    FloatingMenu,
    useEditor
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (updatedContent: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b">
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`px-2 py-1 rounded ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
        >
          Highlight
        </button>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', { level }) ? 'bg-gray-200' : ''
            }`}
          >
            H{level}
          </button>
        ))}
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded ${editor.isActive('paragraph') ? 'bg-gray-200' : ''}`}
        >
          P
        </button>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          Ordered List
        </button>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          Left
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          Center
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          Right
        </button>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="px-2 py-1 rounded"
        >
          Insert Table
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="px-2 py-1 rounded"
        >
          Add Image
        </button>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded"
        >
          Redo
        </button>
      </div>
    </div>
  );
};

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] } as any)
    ],
    content,
    onUpdate: ({ editor }) => {
      const updatedContent = editor.getHTML();
      onChange(updatedContent);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      
      <BubbleMenu 
        className="flex gap-1 p-1 bg-white border rounded-lg shadow-lg" 
        tippyOptions={{ duration: 100 }} 
        editor={editor}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`px-2 py-1 rounded ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
        >
          Highlight
        </button>
      </BubbleMenu>

      <FloatingMenu
        className="flex gap-1 p-1 bg-white border rounded-lg shadow-lg"
        tippyOptions={{ duration: 100 }}
        editor={editor}
      >
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          List
        </button>
      </FloatingMenu>

      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;