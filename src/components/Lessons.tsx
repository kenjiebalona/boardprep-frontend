import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import "../styles/lessons.scss";
import "../styles/ckeditor-content.scss";
import axiosInstance from "../axiosInstance";
import QuizAttemptsTable from "./QuizAttempts";

interface FailedLesson {
  lesson_id: string;
  lesson_title: string;
}

interface LessonContentProps {
  content: string;
  onBack: () => void;
  markLessonAsCompleted: () => void;
  studentId: string;
  lessonId: string;
  classInstanceId: number;
  userType: string;
  passed: boolean;
  examId: number;
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
  examId,
}) => {
  const [quizPassed, setQuizPassed] = useState(passed);
  const [failedLessons, setFailedLessons] = useState<FailedLesson[]>([]);
  const [isFailedLesson, setIsFailedLesson] = useState(false);
  const [showQuizAttempts, setShowQuizAttempts] = useState(false);

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

    const fetchFailedLessons = async () => {
      try {
        const response = await axiosInstance.get(
          `/exams/${examId}/get-failed-lessons/`,
          {
            params: { student_id: studentId }
          }
        );
        const failedLessons = response.data.failed_lessons as FailedLesson[];
        setFailedLessons(failedLessons);
        setIsFailedLesson(failedLessons.some((lesson) => lesson.lesson_id === lessonId));
      } catch (err) {
        console.error("Error fetching failed lessons:", err);
      }
    };

    fetchQuizStatus();
    fetchFailedLessons();
  }, [lessonId, classInstanceId, studentId, examId]);

  const markdownToHtml = (markdownContent: string): string => {
    return marked(markdownContent) as string; 
  };

  const sanitizedHTML = DOMPurify.sanitize(markdownToHtml(content));

  const handleShowQuizAttempts = () => {
    setShowQuizAttempts(true);
  };

  const handleBackToLessonContent = () => {
    setShowQuizAttempts(false);
  };

  return (
    <div className="lesson-content">
      {showQuizAttempts ? (
        <div>
          <button className="btn-back" onClick={handleBackToLessonContent}>
            Back
          </button>
          <QuizAttemptsTable lessonId={lessonId} classInstanceId={classInstanceId} />
        </div>
      ) : (
        <div>
          <button className="btn-back" onClick={onBack}>
            Back
          </button>
          {userType === 'T' && (
            <button className="btn-students-quiz-attempts" onClick={handleShowQuizAttempts}>
              Students Quiz Attempts
            </button>
          )}
          <div
            className="ck-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
          {userType !== 'T' && !quizPassed && isFailedLesson && (
            <button className="btn-mat" onClick={markLessonAsCompleted}>
              Proceed to Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonContent;
