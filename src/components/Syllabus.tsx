import { useState, useEffect } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaBookOpen, FaChevronDown, FaChevronUp, FaLock } from "react-icons/fa";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import "../styles/syllabus.scss";
import AddTopicModal from "./AddTopicModal";
import AddSubtopicModal from "./AddSubtopicModal";
import axiosInstance from "../axiosInstance";
import MasteryModal from "../components/MasteryModal";
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

interface Course {
  course_id: string;
  course_title: string;
}

interface SyllabusProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string) => Promise<void>;
  onTopicClick: (topicId: string) => void;
  onSubtopicClick: (subtopicId: string) => void;
  currentLesson: string | null;
  currentTopic: string | null;
  currentSubtopic: string | null;
  handleQuizClick?: (
    lessonID: string,
    subtopicID: string,
    isSubtopic: boolean
  ) => void;
  hasPreassessment?: boolean;
  courseId?: string;
}

function Syllabus({
  lessons,
  onLessonClick,
  onTopicClick,
  onSubtopicClick,
  currentLesson,
  currentTopic,
  currentSubtopic,
  handleQuizClick,
  hasPreassessment,
  courseId,
}: SyllabusProps) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [lessonList, setLessonList] = useState<Lesson[]>(lessons);
  const [learningObjective, setLearningObjective] = useState<number>(0);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);

  const [isMasteryModalOpen, setIsMasteryModalOpen] = useState(false);
  const [masteryData, setMasteryData] = useState<any>(null);
  const [currentMasteryLessonId, setCurrentMasteryLessonId] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleMasteryClick = async (lessonId: string) => {
    setCurrentMasteryLessonId(lessonId);
    setIsLoading(true);

    const studentId = user.token.id;

    try {
      const { data } = await axiosInstance.get(
        `/mastery/?student_id=${studentId}&course_id=${courseId}`
      );

      console.log("Fetched Mastery Data:", data);

      const masteryData = data.masteries.syllabus;

      if (Array.isArray(masteryData)) {
        const selectedLesson = masteryData.find(
          (lesson: any) => lesson.lesson_id === lessonId
        );
        if (selectedLesson) {
          setMasteryData([selectedLesson]);
          setIsMasteryModalOpen(true);
        } else {
          console.error("Lesson not found in the mastery data");
        }
      } else {
        console.error("Mastery data is not in the expected format (array)");
      }
    } catch (error) {
      console.error("Error fetching mastery data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLessonList(lessons);
  }, [lessons]);
  const handleTopicAdded = (newTopic: Topic, lessonId: string) => {
    setLessonList((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.lesson_id === lessonId
          ? { ...lesson, topics: [...lesson.topics, newTopic] }
          : lesson
      )
    );
  };

  const handleSubtopicAdded = (newSubtopic: Subtopic, topicId: string) => {
    setLessonList((prevLessons) =>
      prevLessons.map((lesson) => ({
        ...lesson,
        topics: lesson.topics.map((topic) =>
          topic.topic_id === topicId
            ? { ...topic, subtopics: [...topic.subtopics, newSubtopic] }
            : topic
        ),
      }))
    );
  };

  const toggleDropdown = (lessonId: string, topics: Topic[]) => {
    setOpenLessonId((prevLessonId) =>
      prevLessonId === lessonId ? null : lessonId
    );
    console.log("MAO NI ANG MGA TOPIC: ", topics);
    console.log("Toggled openLessonId:", lessonId);
  };

  const toggleTopicDropdown = (topicId: string) => {
    setOpenTopicId((prevTopicId) => (prevTopicId === topicId ? null : topicId));
  };

  // const getButtonLabel = () => {
  //   if (userType === "C") return "Edit";
  //   if (userType === "T") return "View";
  //   return "Learn";
  // };
  const handleAddTopicClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLessonId(null);
  };

  const handleAddSubtopicClick = (topicId: string) => {
    setSelectedTopicId(topicId);
    setIsSubtopicModalOpen(true);
  };

  const closeSubtopicModal = () => {
    setIsSubtopicModalOpen(false);
    setSelectedTopicId(null);
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

  console.log("Lessons data:", lessons);

  return (
    <div className="syllabus-container">
      <div className="title-container">
        <h2>⦿ Course Lessons</h2>
      </div>

      <div className="lesson-list">
        {lessonList.map((lesson) => {
          console.log("sadasdasdasdsa:", lessonList);
          console.log(
            `Learning objectives for lesson "${lesson.lesson_title}":`,
            lesson.learning_objectives
          );

          return (
            <div key={lesson.lesson_id} className="lesson-container">
              <div className="lesson-item-cont">
                <div className="lesson-item-wrapper">
                  <div
                    className={`lesson-item`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      toggleDropdown(lesson.lesson_id, lesson.topics)
                    }
                  >
                    <FaBookOpen className="lesson-icon" />
                    <h3 className="lesson-title">{lesson.lesson_title}</h3>
                    {lesson.completed && (
                      <BsCheckCircleFill className="completed-icon" />
                    )}
                    {userType === "S" && (
                      <button
                        className="mastery-button"
                        onClick={() => handleMasteryClick(lesson.lesson_id)}
                      >
                        {isLoading ? "⏳" : "🏅"}
                      </button>
                    )}
                    {openLessonId === lesson.lesson_id ? (
                      <FaChevronUp className="chevron-icon" />
                    ) : (
                      <FaChevronDown className="chevron-icon" />
                    )}
                  </div>

                  {openLessonId === lesson.lesson_id && (
                    <div className="topics-container">
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
                        <p> </p>
                      )}

                      {lesson.topics.map((topic) => {
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
                              onClick={() =>
                                toggleTopicDropdown(topic.topic_id)
                              }
                              role="button"
                              tabIndex={0}
                            >
                              <span>{topic.topic_title}</span>
                              {openTopicId === topic.topic_id ? (
                                <FaChevronUp className="chevron-icon" />
                              ) : (
                                <FaChevronDown className="chevron-icon" />
                              )}
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
                                  <div>
                                    <div
                                      key={subtopic.subtopic_id}
                                      style={{ cursor: "pointer" }}
                                      className={`subtopic-item ${
                                        currentSubtopic === subtopic.subtopic_id
                                          ? "active"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        (hasPreassessment ||
                                          userType === "C" ||
                                          userType === "T") &&
                                        onSubtopicClick(subtopic.subtopic_id)
                                      }
                                      role="button"
                                      tabIndex={0}
                                    >
                                      <span style={{ marginRight: 10 }}>
                                        {subtopic.subtopic_title}
                                      </span>
                                      {!hasPreassessment &&
                                        userType === "S" && <FaLock />}
                                    </div>
                                    {userType !== "C" &&
                                      userType !== "T" &&
                                      hasPreassessment && (
                                        <button
                                          className="quiz-button-2"
                                          onClick={() =>
                                            handleQuizClick &&
                                            handleQuizClick(
                                              lesson.lesson_id,
                                              subtopic.subtopic_id,
                                              true
                                            )
                                          }
                                        >
                                          Take quiz
                                        </button>
                                      )}
                                  </div>
                                ))}
                                {userType === "C" && (
                                  <button
                                    className="subtopic-button"
                                    onClick={() =>
                                      handleAddSubtopicClick(topic.topic_id)
                                    }
                                  >
                                    + Add Subtopic
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {userType !== "C" &&
                        userType !== "T" &&
                        hasPreassessment && (
                          <button
                            className="quiz-button"
                            onClick={() =>
                              handleQuizClick &&
                              handleQuizClick(lesson.lesson_id, "", false)
                            }
                          >
                            Take quiz
                          </button>
                        )}
                      {userType === "C" && (
                        <button
                          className="topic-button"
                          onClick={() => handleAddTopicClick(lesson.lesson_id)}
                        >
                          + Add Topic
                        </button>
                      )}
                    </div>
                  )}

                  {/* {userType !== "C" && (
                  <button
                    className="learn-button"
                    onClick={() => handleLessonClick(lesson.lesson_id)}
                  >
                    {getButtonLabel()}
                  </button>
                )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MasteryModal
        isOpen={isMasteryModalOpen}
        masteryData={masteryData}
        onClose={() => setIsMasteryModalOpen(false)}
      />

      {isModalOpen && (
        <AddTopicModal
          lessons={lessonList}
          selectedLessonId={selectedLessonId}
          onClose={closeModal}
          onTopicAdded={handleTopicAdded}
        />
      )}

      {isSubtopicModalOpen && (
        <AddSubtopicModal
          topics={lessonList.flatMap((lesson) => lesson.topics)}
          selectedTopicId={selectedTopicId}
          onClose={closeSubtopicModal}
          onSubtopicAdded={handleSubtopicAdded}
        />
      )}
    </div>
  );
}

export default Syllabus;
