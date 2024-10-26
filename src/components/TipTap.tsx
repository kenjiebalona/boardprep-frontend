// TipTapEditor.tsx
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TipTapEditorProps {
  content: string;
  onChange: (updatedContent: string) => void;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      const updatedContent = editor.getHTML();
      onChange(updatedContent); 
    },
  });

  return (
    <div className="blocknote-editor">
    <EditorContent editor={editor} />;
    </div>
  )
  
};

export default TipTapEditor;
