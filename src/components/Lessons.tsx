import React from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import "../styles/lessons.scss";
import "../styles/ckeditor-content.scss";

interface LessonContentProps {
  content: string;
  onBack: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ content, onBack }) => {
  // Convert Markdown to HTML
  const markdownToHtml = (markdownContent: string): string => {
    return marked(markdownContent) as string; // Type assertion
  };

  // Sanitize the HTML content
  const sanitizedHTML = DOMPurify.sanitize(markdownToHtml(content));

  return (
    <div className="lesson-content">
      <button className="btn-back" onClick={onBack}>
        Back
      </button>
      <div
        className="ck-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </div>
  );
};

export default LessonContent;
