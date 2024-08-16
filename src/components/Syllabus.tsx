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
}

function Syllabus({ lessons, onLessonClick, onExamClick, currentLessonIndex, classId }: SyllabusProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [updatedLessons, setUpdatedLessons] = useState<Lesson[]>(lessons);
  const [userDetails, setUserDetails] = useState<any>({});
  const user = useAppSelector(selectUser);
  const userType = user.token.type;

  useEffect(() => {
    fetchClass();
    fetchUserDetails();
  }, [classId]);

  useEffect(() => {
    fetchQuizAttempts();
  }, [userDetails, lessons]);

  const fetchClass = async () => {
    if (userType === 'C') return;

    if (classId) {
      try {
        const response = await axiosInstance.get(`/classes/${classId}/`);
        setClassName(response.data.className);
      } catch (err) {
        console.error(err);
      }
    }
  };

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

        console.log("QUIZ ATTEMPTS:", response.data);

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
  const allCompleted = displayedLessons.every(lesson => lesson.completed);

  return (
    <div className="syllabus-container">
      <div className="title-container" onClick={toggleDropdown}>
        <h2>
          ⦿ {userType === 'C' ? "Course" : className || "Course"} LESSONS {isDropdownOpen ? "▾" : "▸"}
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

          {userType === 'S' && allCompleted && (
            <div className="exam-container">
              <div
                className="exam-item"
                onClick={onExamClick} 
                role="button"
                tabIndex={0}
              >
                <TbTargetArrow className="exam-icon" />
                <h3 className="exam-title">{className || "Course"} Final Exam</h3>
              </div>
              {/* <button className="learn-button">Take Exam</button> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Syllabus;
