import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Block } from "@blocknote/core";
import "../styles/details.scss";

interface ContentBlockEditorProps {
  blockData: Block;
  onChange: (updatedContent: Block[]) => void;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({ blockData, onChange }) => {
  const editor = useCreateBlockNote({
    initialContent: blockData ? [blockData] : [{ type: "paragraph", content: "New block content" }],
  });

  const handleEditorChange = () => {
    const updatedContent = editor.document;
    onChange(updatedContent);
  };

  return (
    <div className="blocknote-editor">
      <BlockNoteView className="white-blocknote" editor={editor} onChange={handleEditorChange} />
    </div>
  );
};

export default ContentBlockEditor;
