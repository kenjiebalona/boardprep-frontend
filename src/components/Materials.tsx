import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import Syllabus from "./Syllabus";
import LessonContent from "./Lessons";
import QuizContent from "./QuizContent";
import QuizResult from "./QuizResult";
import "../styles/materials.scss";
import ReactPaginate from "react-paginate";
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';

interface Page {
  page_number: number;
  content: string;
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  content: string;
  completed: boolean;
  quiz_id: string;
}

interface MaterialsProps {
  courseId: string;
  studentId: string;
  classId: number;  
}

function Materials({ courseId, studentId, classId }: MaterialsProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(-1);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showLessonContent, setShowLessonContent] = useState(false);
  const [showQuizContent, setShowQuizContent] = useState(false);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const pageCount = pages.length;

  useEffect(() => {
    const fetchSyllabusAndFirstLesson = async () => {
      try {
        const syllabusResponse = await axiosInstance.get(`/syllabi/${courseId}/`);
        const syllabusData = syllabusResponse.data[0];
        setLessons(
          syllabusData.lessons.map((lesson: Lesson, index: number) => ({
            ...lesson,
            completed: false,
            quiz_id: `Lesson ${index + 1} Quiz`,
          }))
        );

        if (syllabusData.lessons.length > 0) {
          setCurrentLessonIndex(0);
        }
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      }
    };

    if (courseId) {
      fetchSyllabusAndFirstLesson();
    }
  }, [courseId]);

  const fetchPages = async (lessonId: string) => {
    try {
      const response = await axiosInstance.get(`/pages/${lessonId}/`);
      setPages(response.data);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const fetchQuizResult = async (quizId: string) => {
    try {
      const response = await axiosInstance.get(`/quizzes/${quizId}/results/${studentId}`);
      setQuizResult(response.data);
      setShowQuizResult(true);
      setShowQuizContent(false);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    }
  };

  const handleLessonClick = (lessonId: string, isQuiz: boolean) => {
    if (isQuiz && lessons[currentLessonIndex].completed) {
      fetchQuizResult(lessons[currentLessonIndex].quiz_id);
    } else if (!isQuiz) {
      fetchPages(lessonId);
      setCurrentLesson(lessonId);
      setShowLessonContent(true); 
      setShowQuizContent(false); 
    }
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const markLessonAsCompleted = () => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson, index) =>
        index === currentLessonIndex ? { ...lesson, completed: true } : lesson
      )
    );

    setShowLessonContent(false); 
    setShowQuizContent(true); 
  };

  const handleBackToSyllabus = () => {
    setShowLessonContent(false); 
    setShowQuizContent(false);   
    setShowQuizResult(false);
  };

  const handleTryAgain = () => {
    if (currentLesson) {
      setShowQuizResult(false); 
      setShowQuizContent(false); 
      setShowLessonContent(true); 
      fetchPages(currentLesson); 
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex + 1 < lessons.length) {

      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
      
      setCurrentLessonIndex(currentLessonIndex + 1);
      const nextLesson = lessons[currentLessonIndex + 1].lesson_id;
      setCurrentLesson(nextLesson);
      
    } else {
      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
    }
  };

  return (
    <div className="materials-page">
      <div className="lesson-content-container">
        {!showLessonContent && !showQuizContent && !showQuizResult && (
          <div className="syllabus-section">
            <Syllabus 
              lessons={lessons} 
              onLessonClick={handleLessonClick} 
              currentLessonIndex={currentLessonIndex} 
              classId={classId.toString()} 
            />
          </div>
        )}

        {showLessonContent && currentLesson && pages.length > 0 && (
          <LessonContent 
          content={pages[currentPage].content} 
          onBack={handleBackToSyllabus} 
          markLessonAsCompleted={markLessonAsCompleted}
          userType={userType}
          studentId={studentId}
          lessonId={currentLesson}
          classInstanceId={classId}
          passed={quizResult?.passed ?? false} 
        />
        )}

        {showQuizContent && currentLesson && (
          <QuizContent
            lessonId={currentLesson}
            studentId={studentId}
            classInstanceId={classId} 
            onTryAgain={handleTryAgain}
            onNextLesson={handleNextLesson}
          />
        )}

        {showQuizResult && quizResult && (
          <QuizResult 
            questions={quizResult.questions} 
            answers={quizResult.answers} 
            results={quizResult.results} 
            score={quizResult.score} 
            totalQuestions={quizResult.totalQuestions} 
            passed={quizResult.passed} 
            onTryAgain={handleTryAgain}
            onNextLesson={handleNextLesson}
          />
        )}

        {pageCount > 1 && showLessonContent && currentLesson && (
          <ReactPaginate
            previousLabel={currentPage > 0 ? "previous" : ""}
            nextLabel={currentPage < pageCount - 1 ? "next" : ""}
            breakLabel={"..."}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        )}
      </div>
    </div>
  );
}

export default Materials;
