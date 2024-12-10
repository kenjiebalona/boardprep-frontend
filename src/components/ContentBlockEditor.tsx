import { Block } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "../styles/details.scss";

interface ContentBlockEditorProps {
  index: number;
  blockData: Block;
  onChange: (id: string, updatedContent: string) => void;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({ index, blockData, onChange }) => {
  const editor = useCreateBlockNote({
    initialContent: blockData ? [blockData] : [{ type: "paragraph", content: "New block content" }],
  });

  const handleEditorChange = () => {
    const block = editor.document[index];
    if (block) {
      const newContent = JSON.stringify(block.content); 
      onChange(block.id, newContent); 
    }
  };

  return (
    <div className="blocknote-editor">
      <BlockNoteView
        className="white-blocknote"
        editor={editor}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default ContentBlockEditor;
