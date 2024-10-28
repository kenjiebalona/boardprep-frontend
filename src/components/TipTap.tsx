import { faAlignCenter, faAlignLeft, faAlignRight, faBold, faVideo, faCode, faEllipsisH, faHeading, faHighlighter, faImage, faItalic, faListOl, faListUl, faParagraph, faQuoteRight, faRedo, faStrikethrough, faTable, faTerminal, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import ListItem from '@tiptap/extension-list-item';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import TextStyle from '@tiptap/extension-text-style';
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from 'react';
import "../styles/tiptapeditor.scss";
import ResizeImage from 'tiptap-extension-resize-image';

interface TipTapEditorProps {
  content: string;
  onChange?: (updatedContent: string) => void;
  editable?: boolean;
  hideToolbar?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [imageDropdownOpen, setImageDropdownOpen] = useState(false);


  if (!editor) {
    return null;
  }

  const toggleHeaderDropdown = () => {
    setHeaderDropdownOpen(!headerDropdownOpen);
    setTableDropdownOpen(false);
    setImageDropdownOpen(false);
  };

  const toggleImageDropdown = () => {
    setImageDropdownOpen(!imageDropdownOpen);
    setHeaderDropdownOpen(false);
    setTableDropdownOpen(false);
  };

  const toggleTableDropdown = () => {
    setTableDropdownOpen(!tableDropdownOpen);
    setHeaderDropdownOpen(false);
    setImageDropdownOpen(false);
  };

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 780,
        height: 400,
      })
    }
  }

  const handleHeading = (level: number) => {
    editor.chain().focus().toggleHeading({ level }).run();
    setHeaderDropdownOpen(false);
  };

  const showTableMenu = () => {
    if (editor.isActive('table')) {
      setTableMenuVisible(true);
    } else {
      setTableMenuVisible(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result?.toString() || '';
        editor.chain().focus().setImage({ src: base64Data }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="menu-bar">
      <div className="heading-buttons">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleCode()
              .run()
          }
          className={editor.isActive('code') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faCode} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faTerminal} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faQuoteRight} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faHighlighter} />
        </button>
      </div>

      <div className="dropdown-container">
          <button onClick={toggleHeaderDropdown} className={headerDropdownOpen  ? 'active' : ''}>
            <FontAwesomeIcon icon={faHeading} />
          </button>
          {headerDropdownOpen  && (
            <div className="dropdown-menu">
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <div key={level} onClick={() => handleHeading(level)}>
                  H{level}
                </div>
              ))}
            </div>
          )}
        </div>
      <div className="list-buttons">
      <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faParagraph} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>
      </div>

      <div className="align-buttons">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faAlignLeft} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faAlignCenter} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
        >
          <FontAwesomeIcon icon={faAlignRight} />
        </button>
      </div>

      <div className="insert-buttons">
      <div className="dropdown-container2">
        <button onClick={toggleImageDropdown} className={imageDropdownOpen ? 'active' : ''}>
          <FontAwesomeIcon icon={faImage} />
        </button>
        {imageDropdownOpen && (
          <div className="dropdown-menu">
            <div
              onClick={() => {
                const url = window.prompt('Enter image URL:');
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
                setImageDropdownOpen(false);
              }}
            >
              From URL...
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  handleImageUpload(event);
                  setImageDropdownOpen(false);
                }}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">From Device...</label>
            </div>
          </div>
        )}
      </div>
      <div className="dropdown-container2">
          <button onClick={addYoutubeVideo} title="Add YouTube video">
            <FontAwesomeIcon icon={faVideo} /> {/* Video icon */}
          </button>
        </div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded"
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
        <button
          onClick={() => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            showTableMenu();
          }}
          className="px-2 py-1 rounded"
        >
          <FontAwesomeIcon icon={faTable} />
        </button>
      </div>
      {tableMenuVisible && (
          <div className="table-dropdown-container">
            <button onClick={toggleTableDropdown} className={tableDropdownOpen ? 'active' : ''}>
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
           {tableDropdownOpen  && (
             <div className="table-dropdown-menu">
                <button onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>
                  Add column before
                </button>
                <button onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
                  Add column after
                </button>
                <button onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
                  Delete column
                </button>
                <button onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>
                  Add row before
                </button>
                <button onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
                  Add row after
                </button>
                <button onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
                  Delete row
                </button>
                <button onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
                  Delete table
                </button>
                <button onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>
                  Merge cells
                </button>
                <button onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>
                  Split cell
                </button>
              </div>
            )}
            </div>
      )}
    </div>
  );
};

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange, editable = true, hideToolbar = false }) => {
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
      ResizeImage,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] } as any),
      Youtube.configure({ controls: false, nocookie: true }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const updatedContent = editor.getHTML();
        onChange(updatedContent);
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-container">
       {!hideToolbar && <MenuBar editor={editor} />}


      <BubbleMenu
        className="flex gap-1 p-1 bg-white border rounded-lg shadow-lg"
        tippyOptions={{ duration: 100 }}
        editor={editor}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'active' : ''}
        >
          Highlight
        </button>
      </BubbleMenu>

      <FloatingMenu
        className="floating-menu"
        tippyOptions={{ duration: 100 }}
        editor={editor}
      >
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'active' : ''}
        >
          List
        </button>
      </FloatingMenu>

      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;
