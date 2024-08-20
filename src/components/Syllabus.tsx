import React, { useState, useEffect } from "react";
import "../styles/syllabus.scss";
import { FaLock, FaBookOpen } from "react-icons/fa";
import { BsShieldCheck, BsCheckCircleFill } from "react-icons/bs";
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';
import { TbTargetArrow } from "react-icons/tb";
import axiosInstance from "../axiosInstance";

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  completed: boolean;
  quiz_id: string;
  quiz_completed?: boolean;
}

interface SyllabusProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string, isQuiz: boolean) => void;
  onExamClick?: () => void;
  currentLessonIndex: number;
  classId?: string;
  courseId: string; 
}

function Syllabus({ lessons, onLessonClick, onExamClick, currentLessonIndex, classId, courseId }: SyllabusProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [updatedLessons, setUpdatedLessons] = useState<Lesson[]>(lessons);
  const [userDetails, setUserDetails] = useState<any>({});
  const [examPassed, setExamPassed] = useState(false);
  const user = useAppSelector(selectUser);
  const userType = user.token.type;

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    fetchQuizAttempts();
  }, [userDetails, lessons]);

useEffect(() => {
  fetchExamStatus(); 
}, [userDetails, courseId]);

  const fetchUserDetails = async () => {
    try {
      const res = await axiosInstance.get('/get/user/', {
        params: {
          username: user.token.id,
        },
      });
      setUserDetails(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchQuizAttempts = async () => {
    if (!classId || userType === 'C') return;

    try {
      const updatedLessonsData = await Promise.all(lessons.map(async (lesson) => {
        const response = await axiosInstance.get(`/quizzes/class/?lesson_id=${lesson.lesson_id}&class_id=${classId}`);
        const attempts = response.data;

        const quizCompleted = attempts.some((attempt: any) => 
          attempt.student === `${userDetails.first_name} ${userDetails.last_name}` && attempt.passed
        );

        return { ...lesson, quiz_completed: quizCompleted, completed: quizCompleted };
      }));

      setUpdatedLessons(updatedLessonsData);
    } catch (err) {
      console.error("Error fetching quiz attempts:", err);
    }
  };

  const fetchExamStatus = async () => {
    console.log('fetchExamStatus called');
    if (!classId || !userDetails.user_name || !courseId) return;
  
    try {
      const response = await axiosInstance.get('/api/exams/student-info/', {
        params: {
          student_id: userDetails.user_name,
          class_instance_id: classId,
          course_id: courseId
        },
      });
  
      console.log('Exam Status Response:', response.data);
  
      const exams = response.data.exams || [];
      const examPassed = exams.length > 0 && exams[0].passed;
  
      console.log('Exam Passed:', examPassed); 
      console.log('All Lessons Completed:', updatedLessons.every(lesson => lesson.completed)); 
  
      setExamPassed(examPassed);
    } catch (err) {
      console.error("Error fetching exam status:", err);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getButtonLabel = () => {
    if (userType === 'C') return 'Edit';
    if (userType === 'T') return 'View';
    return 'Learn';
  };

  const handleLessonClick = (lessonId: string, isQuiz: boolean) => {
    onLessonClick(lessonId, isQuiz);
    fetchQuizAttempts();
  };

  const displayedLessons = userType === 'C' ? lessons : updatedLessons;
  const allLessonsCompleted = displayedLessons.every(lesson => lesson.completed);

  return (
    <div className="syllabus-container">
      <div className="title-container" onClick={toggleDropdown}>
        <h2>
          ⦿ {userType === 'C' ? "Course" : courseId || "Course"} LESSONS {isDropdownOpen ? "▾" : "▸"}
        </h2>
      </div>

      {isDropdownOpen && (
        <div className="lesson-list">
          {displayedLessons.map((lesson, index) => (
            <div key={lesson.lesson_id} className="lesson-container">
              <div className="lesson-item-cont">
                <div className="lesson-item-wrapper">
                  <div
                    className={`lesson-item ${
                      userType === 'S' && index > currentLessonIndex && !displayedLessons[index - 1]?.completed ? 'disabled' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    <FaBookOpen className="lesson-icon" />
                    <h3 className="lesson-title">{lesson.lesson_title}</h3>
                    {lesson.completed && userType !== 'T' && <BsCheckCircleFill className="completed-icon" />}
                    {userType === 'S' && index > currentLessonIndex && !displayedLessons[index - 1]?.completed && (
                      <FaLock className="lock-icon" />
                    )}
                  </div>

                  {(userType !== 'S' || index <= currentLessonIndex || displayedLessons[index - 1]?.completed) && (
                    <button
                      className="learn-button"
                      onClick={() => handleLessonClick(lesson.lesson_id, false)}
                    >
                      {getButtonLabel()}
                    </button>
                  )}
                </div>
              </div>

              {userType === 'S' && (
                <div className="quiz-container">
                  <div
                    className={`quiz-item ${
                      index > currentLessonIndex || !lesson.completed || lesson.quiz_completed ? '' : 'disabled'
                    } ${index > currentLessonIndex && !lesson.quiz_completed ? 'disabled' : ''}`}
                    onClick={() =>
                      !(index > currentLessonIndex && !lesson.quiz_completed) && 
                      index <= currentLessonIndex && lesson.completed && !lesson.quiz_completed &&
                      handleLessonClick(lesson.quiz_id, true)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <BsShieldCheck className="quiz-icon" />
                    <span className="quiz-label">{lesson.lesson_title} Quiz</span>
                    {lesson.quiz_completed && <BsCheckCircleFill className="completed-icon" />}
                    {!lesson.quiz_completed && index > currentLessonIndex && <FaLock className="quiz-lock-icon" />}
                  </div>
                </div>
              )}
            </div>
          ))}

          {userType === 'S' && (
            <div className={`exam-container ${allLessonsCompleted ? '' : 'disabled'}`}>
              <div
                className={`exam-item ${examPassed ? 'completed' : (allLessonsCompleted ? '' : 'disabled')}`}
                onClick={() => allLessonsCompleted && !examPassed && onExamClick && onExamClick()}
                role="button"
                tabIndex={0}
              >
                <TbTargetArrow className="exam-icon" />
                <h3 className="exam-title">{courseId || "Course"} Final Exam</h3>
              </div>
              {examPassed && <BsCheckCircleFill className="completed-icon" />}
              {!allLessonsCompleted && <FaLock className="exam-lock-icon" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Syllabus;
