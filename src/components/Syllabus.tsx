import { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaBookOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import "../styles/syllabus.scss";

interface Objective {
  text: string;
}

interface Topic {
  topic_id: string;
  topic_title: string;
  order: number;
  subtopics: Subtopic[];
  learning_objectives: Objective[];
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
  completed: boolean;
  quiz_id: string;
  topics: Topic[];
  learning_objectives: Objective[];
}

interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
  order: number;
}

interface SyllabusProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string) => Promise<void>;
  onTopicClick: (topicId: string) => void;
  onSubtopicClick: (subtopicId: string) => void;
  currentLesson: string | null;
  currentTopic: string | null;
  currentSubtopic: string | null;
}

function Syllabus({
  lessons,
  onLessonClick,
  onTopicClick,
  onSubtopicClick,
  currentLesson,
  currentTopic,
  currentSubtopic,
}: SyllabusProps) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const user = useAppSelector(selectUser);
  const userType = user.token.type;

  const toggleDropdown = (lessonId: string) => {
    setOpenLessonId((prevLessonId) => (prevLessonId === lessonId ? null : lessonId));
    console.log("Toggled openLessonId:", lessonId);
  };

  const toggleTopicDropdown = (topicId: string) => {
    setOpenTopicId((prevTopicId) => (prevTopicId === topicId ? null : topicId));
  };

  const getButtonLabel = () => {
    if (userType === "C") return "Edit";
    if (userType === "T") return "View";
    return "Learn";
  };

  const handleLessonClick = (lessonId: string) => {
    onLessonClick(lessonId);
  };

  const handleTopicClick = (topicId: string) => {
    onTopicClick(topicId);
  };

  const handleSubtopicClick = (subtopicId: string) => {
    console.log("naa ko diri: ", subtopicId);
    onSubtopicClick(subtopicId);
  };

  // Log the lessons array
  console.log("Lessons data:", lessons);

  return (
    <div className="syllabus-container">
      <div className="title-container">
        <h2>⦿ Course Lessons</h2>
      </div>

      <div className="lesson-list">
        {lessons.map((lesson) => {
          console.log(
            `Learning objectives for lesson "${lesson.lesson_title}":`,
            lesson.learning_objectives
          );

          return (
            <div key={lesson.lesson_id} className="lesson-container">
              <div className="lesson-item-cont">
                <div className="lesson-item-wrapper">
                  <div
                    className={`lesson-item ${
                      lesson.completed || userType === "C" ? "" : "disabled"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleDropdown(lesson.lesson_id)}
                  >
                    <FaBookOpen className="lesson-icon" />
                    <h3 className="lesson-title">{lesson.lesson_title}</h3>
                    {lesson.completed && (
                      <BsCheckCircleFill className="completed-icon" />
                    )}
                    {openLessonId === lesson.lesson_id ? (
                      <FaChevronUp className="chevron-icon" />
                    ) : (
                      <FaChevronDown className="chevron-icon" />
                    )}
                  </div>

                  {openLessonId === lesson.lesson_id && (
                    <div className="topics-container">
                      {/* Render lesson objectives */}
                      {lesson.learning_objectives &&
                      lesson.learning_objectives.length > 0 ? (
                        <div className="lesson-objectives">
                          <h4>Lesson Objectives:</h4>
                          <ul className="bullet-objectives">
                            {lesson.learning_objectives.map(
                              (objective, index) => (
                                <li key={index}>{objective.text}</li>
                              )
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p>No learning objectives for this lesson.</p>
                      )}

                      {lesson.topics.map((topic) => {
                        // Log topic objectives
                        console.log(
                          `Learning objectives for topic "${topic.topic_title}":`,
                          topic.learning_objectives
                        );

                        return (
                          <div key={topic.topic_id}>
                            <div
                              className={`topic-item ${
                                currentTopic === topic.topic_id ? "active" : ""
                              }`}
                              onClick={() => toggleTopicDropdown(topic.topic_id)}
                              role="button"
                              tabIndex={0}
                            >
                              <span>{topic.topic_title}</span>
                              {openTopicId === topic.topic_id ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
                            </div>

                            {/* Render topic objectives */}
                            {topic.learning_objectives &&
                              topic.learning_objectives.length > 0 && (
                                <div className="topic-objectives">
                                  <h5>Objectives:</h5>
                                  <ul>
                                    {topic.learning_objectives.map(
                                      (objective, index) => (
                                        <li key={index}>{objective.text}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {openTopicId === topic.topic_id && (
                            <div className="subtopics-container">
                              {topic.subtopics.map((subtopic) => (
                                <div
                                  key={subtopic.subtopic_id}
                                  className={`subtopic-item ${currentSubtopic === subtopic.subtopic_id ? "active" : ""}`}
                                  onClick={() => onSubtopicClick(subtopic.subtopic_id)}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <span>{subtopic.subtopic_title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {userType !== "C" && (
                  <button
                    className="learn-button"
                    onClick={() => handleLessonClick(lesson.lesson_id)}
                  >
                    {getButtonLabel()}
                  </button>
                )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Syllabus;
