import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import "../styles/lessons.scss";
import "../styles/ckeditor-content.scss";
import axiosInstance from "../axiosInstance";

interface LessonContentProps {
  content: string;
  onBack: () => void;
  markLessonAsCompleted: () => void;
  studentId: string;
  lessonId: string;
  classInstanceId: number;
  userType: string;
  passed: boolean;
}

const LessonContent: React.FC<LessonContentProps> = ({
  content,
  onBack,
  markLessonAsCompleted,
  studentId,
  lessonId,
  classInstanceId,
  userType,
  passed,
}) => {
  const [quizPassed, setQuizPassed] = useState(passed);

  useEffect(() => {
    const fetchQuizStatus = async () => {
      try {
        const response = await axiosInstance.get(
          `/quizzes/class/?lesson_id=${lessonId}&class_id=${classInstanceId}`
        );
        const attempts = response.data;
        if (attempts.length > 0 && attempts.some((attempt: any) => attempt.passed)) {
          setQuizPassed(true);
        }
      } catch (err) {
        console.error("Error fetching quiz status:", err);
      }
    };

    fetchQuizStatus();
  }, [lessonId, classInstanceId]);

  const markdownToHtml = (markdownContent: string): string => {
    return marked(markdownContent) as string; 
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
      {userType !== 'T' && !quizPassed && (
        <button className="btn-mat" onClick={markLessonAsCompleted}>
          Proceed to Quiz
        </button>
      )}
    </div>
  );
};

export default LessonContent;
