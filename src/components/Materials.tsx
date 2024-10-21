import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import Syllabus from "./Syllabus";
import LessonContent from "./Lessons";
import QuizContent from "./QuizContent";
import QuizResult from "./QuizResult";
import ExamContent from "./ExamContent"; 
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

interface Course {
  course_id: string;
  course_title: string;
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
  const [showExamContent, setShowExamContent] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [allLessonsCompleted, setAllLessonsCompleted] = useState(false);
  const [examId, setExamId] = useState<number | null>(null);
  const [currentSubtopic, setCurrentSubtopic] = useState<string | null>(null); // New state for current subtopic
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const pageCount = pages.length;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseResponse = await axiosInstance.get(`/courses/${courseId}/`);
        const courseData: Course = courseResponse.data;
        setCourseTitle(courseData.course_title);

        const syllabusResponse = await axiosInstance.get(`/syllabi/${courseId}/`);
        const syllabusData = syllabusResponse.data[0];
        
        const lessonsData = syllabusData.lessons.map((lesson: Lesson, index: number) => ({
          ...lesson,
          completed: false,
          quiz_id: `Lesson ${index + 1} Quiz`,
        }));

        setLessons(lessonsData);
        if (lessonsData.length > 0) {
          setCurrentLessonIndex(0);
        }
        
        const examResponse = await axiosInstance.get(`/api/exams/student-info/`, {
          params: {
            student_id: studentId,
            class_instance_id: classId,
            course_id: courseId
          }
        });

        console.log('Exam Response:', examResponse.data);  
        
        if (examResponse.data && examResponse.data.exams.length > 0) {
          const examData = examResponse.data.exams[0];
          setExamId(examData.exam_id);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCourseData();
  }, [courseId, studentId, classId]);

  useEffect(() => {
    const checkAllLessonsCompleted = () => {
      const completed = lessons.every(lesson => lesson.completed);
      setAllLessonsCompleted(completed);
    };

    checkAllLessonsCompleted();
  }, [lessons]);

  const fetchPages = async (subtopicId: string) => {
    try {
      const response = await axiosInstance.get(`/pages/${subtopicId}/`);
      setPages(response.data);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const handleSubtopicClick = (subtopicId: string) => {
    console.log('Subtopic clicked:', subtopicId); // Add this line for debugging
    setCurrentSubtopic(subtopicId); // Set the current subtopic
    fetchPages(subtopicId); // Fetch pages for the clicked subtopic
    
  };

  const handleTopicClick = (subtopicId: string) => {
    console.log('Topic clicked:', subtopicId); // Add this line for debugging
    setCurrentSubtopic(subtopicId); // Set the current subtopic
    fetchPages(subtopicId); // Fetch pages for the clicked subtopic
    
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
    if (isQuiz && lessons[currentLessonIndex]?.completed) {
      fetchQuizResult(lessons[currentLessonIndex].quiz_id);
    } else if (!isQuiz) {
      fetchPages(lessonId);
      setCurrentLesson(lessonId);
      setShowLessonContent(true);
      setShowQuizContent(false);
      setShowQuizResult(false);
      setShowExamContent(false);
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
    setShowQuizResult(false);
    setShowExamContent(false);
  };

  const handleBackToSyllabus = () => {
    setShowLessonContent(false); 
    setShowQuizContent(false);   
    setShowQuizResult(false);
    setShowExamContent(false);
  };

  const handleTryAgain = () => {
    if (currentLessonIndex + 1 < lessons.length) {
      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
      setShowExamContent(false);
      
      setCurrentLessonIndex(currentLessonIndex + 1);
      const nextLesson = lessons[currentLessonIndex + 1].lesson_id;
      setCurrentLesson(nextLesson);
    } else {
      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
      setShowExamContent(false);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex + 1 < lessons.length) {
      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
      setShowExamContent(false);
      
      setCurrentLessonIndex(currentLessonIndex + 1);
      const nextLesson = lessons[currentLessonIndex + 1].lesson_id;
      setCurrentLesson(nextLesson);
    } else {
      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
      setShowExamContent(false);
    }
  };

  const handleExamClick = () => {
    setShowExamContent(true);
    setShowLessonContent(false);
    setShowQuizContent(false); 
    setShowQuizResult(false); 
    setCurrentLessonIndex(-1); 
  };

  return (
    <div className="materials-page">
      <div className="lesson-content-container">
        {!showLessonContent && !showQuizContent && !showQuizResult && !showExamContent && (
          <div className="syllabus-section">
            <Syllabus
              lessons={lessons}
              onLessonClick={handleLessonClick}
              onSubtopicClick={handleSubtopicClick}
              onTopicClick={handleTopicClick}
              currentLesson={currentLesson}
              currentSubtopic={currentSubtopic} // Pass currentSubtopic
              classId={classId.toString()}
              courseId={courseId} 
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
            examId={examId ?? -1} 
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

        {showExamContent && (
          <ExamContent
            studentId={studentId}
            classInstanceId={classId}
            courseId={courseId}
            title={courseTitle ?? "Final Exam"}
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
