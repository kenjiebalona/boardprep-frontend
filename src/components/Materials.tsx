import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';
import '../styles/materials.scss';
import ExamContent from './ExamContent';
import QuizContent from './QuizContent';
import QuizResult from './QuizResult';
import Syllabus from './Syllabus';
import TipTapEditor from './TipTap';

interface Page {
  page_id: string;
  page_number: number;
  content_blocks: ContentBlock[];
  syllabus: string;
}

interface Objective {
  text: string;
}

interface LearningObjective {
  id: number;
  text: string;
  subtopic: number;
}

interface Topic {
  topic_id: string;
  topic_title: string;
  order: number;
  subtopics: Subtopic[];
  learning_objectives: Objective[];
}

interface Subtopic {
  subtopic_id: string;
  subtopic_title: string;
  order: number;
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  order: number;
  syllabus: string;
  content: string;
  completed: boolean;
  topics: Topic[];
  learning_objectives: Objective[];
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

interface ContentBlock {
  block_id: number;
  block_type: string;
  difficulty: string;
  content: string;
}

interface Mastery {
  id: number;
  mastery_level: number;
  questions_attempted: number;
  last_updated: string;
  student: string;
  learning_objective: number;
}

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  choices: Choice[];
  correct_option: string;
}

interface Attempt {
  id: number;
  exam: number;
  score: number;
  feedback: string;
  start_time: Date;
  end_time: Date;
  questions: Question[];
}

function Materials({ courseId, studentId, classId }: MaterialsProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageMapping, setPageMapping] = useState<{ [key: number]: string }>({});
  const [pageId, setPageId] = useState(0);
  const [pageCount, setPageCount] = useState(0);
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
  const [currentSubtopic, setCurrentSubtopic] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [hasPreassessment, setHasPreassessment] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasExam, setHasExam] = useState(false);
  const [showExamAttempts, setShowExamAttempts] = useState(false);
  const [showExamAttemptQuestions, setShowExamAttemptQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examAttempts, setExamAttempts] = useState<Attempt[]>([]);
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [progress, setProgress] = useState(0);
  const [clickedSubtopics, setClickedSubtopics] = useState<Set<string>>(
    new Set()
  );
  const [masteries, setMasteries] = useState<Mastery[]>([]);
  const [filterType, setFilterType] = useState<Set<string>>(new Set());

  const [showMoreMaterials, setShowMoreMaterials] = useState(false);
  const [isSubtopic, setIsSubtopic] = useState(false);
  const [quizSubtopicId, setQuizSubtopicId] = useState<string | null>(null);

  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const userType = user.token.type;

  const handleMoreMaterialsClick = () => {
    setCurrentPage(1);
    setShowMoreMaterials(true);
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log("21312412412",courseId);
        const courseResponse = await axiosInstance.get(`/courses/${courseId}/`);
        const courseData: Course = courseResponse.data;
        setCourseTitle(courseData.course_title);

        const syllabusData = courseResponse.data.syllabus;
        if (syllabusData && syllabusData.lessons) {
          const lessonsData = syllabusData.lessons.map(
            (lesson: Lesson, index: number) => ({
              ...lesson,
              completed: false,
              quiz_id: `Lesson ${index + 1} Quiz`,
            })
          );
          setLessons(lessonsData);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };
    getQuizAttempts(studentId);
    getExamAttempts(studentId);
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const checkAllLessonsCompleted = () => {
      const completed = lessons.every((lesson) => lesson.completed);
      setAllLessonsCompleted(completed);
    };
    checkAllLessonsCompleted();
  }, [lessons]);

  const fetchMastery = async () => {
    try {
      const response = await axiosInstance.get(
        `/mastery/?student_id=${studentId}`
      );
      setMasteries(response.data);
      setProgress(
        (response.data.filter((m: Mastery) => m.mastery_level >= 60).length /
          response.data.length) *
          100
      );
    } catch (error) {
      console.error("Error fetching mastery data:", error);
    }
  };

  useEffect(() => {
    fetchPreassessment();
    fetchMastery();
  }, []);

  const fetchPreassessment = async () => {
    try {
      // const response = await axiosInstance.get(
      //   `/studentPreassessmentAttempt/?student_id=${studentId}&course_id=${courseId}`
      // );
      const response = await axiosInstance.get(
        `/studentPreassessmentAttempt/?student_id=${studentId}&course_id=FME101`
      );
      if (response.data.length > 0) {
        setHasPreassessment(true);
      }
    } catch (error) {
      console.error('Error fetching preassessment data:', error);
    }
  };

  const fetchPages = async (subtopicId: string) => {
    if (!subtopicId) {
      console.error('Subtopic ID is undefined');
      return;
    }

    try {
      console.log(userType);
      const response = await axiosInstance.get(
        userType === 'S'
          ? `/pages/by_subtopic/${subtopicId}/?student_id=${studentId}`
          : `/pages/by_subtopic/${subtopicId}/`
      );
      console.log('Fetched pages:', response.data);

      const fetchedPages = response.data.pages;
      setPageCount(fetchedPages.length);
      setObjectives(response.data.objectives);
      console.log("Page Count", pageCount);

      const pageMapping = fetchedPages.reduce(
        (acc: { [key: number]: string }, page: Page) => {
          acc[page.page_number] = page.page_id;
          return acc;
        },
        {}
      );

      setPages(response.data.pages);
      console.log("Fetched pages:", response.data.pages);
      setShowLessonContent(true);
      setPageMapping(pageMapping);
      if (response.data.length > 0) {
        setCurrentPage(response.data.pages[0].page_number);
        setPageId(response.data.pages[0].page_id);
      } else {
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleSubtopicClick = (subtopicId: string) => {
    setCurrentSubtopic(subtopicId);

    if (userType === "S" && !clickedSubtopics.has(subtopicId)) {
      setClickedSubtopics((prev) => new Set(prev).add(subtopicId));
    }

    fetchPages(subtopicId);
  };

  function shuffleQuestions(questions: Question[]): Question[] {
    return questions.sort(() => Math.random() - 0.5);
  }

  const getExamAttempts = async (studentId: string) => {
    let exam_id: number = 0;
    let attempts: Attempt[] = [];
    let questions: Question[] = [];
    try {
      const exams = await axiosInstance.get(`/exams/`);

      for (const exam of exams.data) {
        if(exam.student === studentId) {
          exam_id = exam.id;
          questions = exam.questions;
          break;
        }
      }

      const attempt_req = await axiosInstance.get(`/studentExamAttempt/`);

      for(const attempt of attempt_req.data) {
        if(attempt.exam === exam_id && attempt.score !== null) {
          attempt.start_time = new Date(attempt.start_time);
          attempt.end_time = new Date(attempt.end_time);
          attempt.questions = shuffleQuestions([...questions]);
          attempts.push(attempt);
        }
      }

      if(attempts.length > 0) {
        setHasExam(true);
        setExamAttempts(attempts);
      } else {
        console.log("NO EXAM ATTEMPT");
      }

      console.log("EXAM ATTEMPT: ", attempts);
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
    }
  }

  const handleViewQuestions = (questions: Question[]) => {
    setQuestions(questions);
    setShowExamAttemptQuestions(true);
    console.log("QUESTIONS: ", questions);
  }

  const handleCloseViewQuestions = () => {
    setShowExamAttemptQuestions(false);
  }

  const getQuizAttempts = async (studentId: string) => {
    try {
      const quizzes = await axiosInstance.get(`/studentQuizAttempt/by-id/?id=${studentId}`);

      if(quizzes.data.length > 0) {
        console.log("QUIZ ATTEMPT: ", quizzes.data);
        setHasQuiz(true);
      } else {
        console.log("NO QUIZ ATTEMPT");
      }
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
    }
  }

  useEffect(() => {
    if (lessons.length > 0) {
      const totalSubtopics = lessons.reduce(
        (acc, lesson) =>
          acc +
          lesson.topics.reduce(
            (subAcc, topic) => subAcc + topic.subtopics.length,
            0
          ),
        0
      );
      const progressPercentage = (clickedSubtopics.size / totalSubtopics) * 100;
      //setProgress(progressPercentage);
    }
  }, [clickedSubtopics, lessons]);

  const handleTopicClick = (subtopicId: string) => {
    setCurrentSubtopic(subtopicId);
    fetchPages(subtopicId);
  };

  const renderObjectives = () => {
    console.log("test Subtopic:", currentSubtopic);
    console.log("Obj render:", objectives);

    return (
      <div className="objectives-container">
        <h3 className="h3-obj">
          <span role="img" aria-label="target">🎯</span> Learning Objectives
        </h3>
        <ul className="objectives-list">
          {objectives.map((objective, idx) => {
            const masteryLevel = masteries.find((m) => m.learning_objective === objective.id)?.mastery_level ?? 0;
            const masteryColor = masteryLevel >= 60 ? "#28a745" : "#333";
            const masteryIcon = masteryLevel >= 60 ? "✓" : "✗";

            return (
              <li
                key={idx}
                className="objective-item"
                style={{ color: masteryColor }}
              >
                <span className="objective-icon">{masteryIcon}</span> {objective.text}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const fetchQuizResult = async (quizId: string) => {
    try {
      const response = await axiosInstance.get(
        `/quizzes/${quizId}/results/${studentId}`
      );
      setQuizResult(response.data);
      setShowQuizResult(true);
      setShowQuizContent(false);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    }
  };

  const handleLessonClick = async (lessonId: string) => {
    setCurrentLesson(lessonId);
  };

  // const handleLessonClick = (lessonId: string, isQuiz: boolean) => {
  //   if (isQuiz && lessons[currentLessonIndex]?.completed) {
  //     fetchQuizResult(lessons[currentLessonIndex].quiz_id);
  //   } else if (!isQuiz) {
  //     fetchPages(lessonId);
  //     setCurrentLesson(lessonId);
  //     setShowLessonContent(true);
  //     setShowQuizContent(false);
  //     setShowQuizResult(false);
  //     setShowExamContent(false);
  //   }
  // };

  const handleMaterialsPageClick  = async (event: { selected: number }) => {
    const newPageNumber = event.selected;
    const newPageId = pageMapping[newPageNumber];

    console.log('Page Number', newPageNumber);
    console.log('Page ID', newPageId);

    setCurrentPage(newPageNumber);
    if (newPageId) {
      try {
        const response = await axiosInstance.get(`/pages/${newPageId}`);
        if (response.data) {
          setPageId(Number(newPageId));
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      }
    }
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

  // const handleBackToSyllabus = () => {
  //   setShowLessonContent(false);
  //   setShowQuizContent(false);
  //   setShowQuizResult(false);
  //   setShowExamContent(false);
  // };

  const handleBackButtonClick = () => {
    if (currentPage === 1) {
      setCurrentPage(0);
    } else {
      setShowLessonContent(false);
      setShowQuizContent(false);
      setShowQuizResult(false);
      setShowExamContent(false);
    }
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

  const handleQuizClick = (lessonID: string, subtopicID: string, isSubtopic: boolean) => {

    setShowLessonContent(true);
    setShowQuizContent(true);
    setShowQuizResult(false);
    setShowExamContent(false);
    setCurrentLesson(lessonID);
    setQuizSubtopicId(subtopicID);
    if(subtopicID.length !== 0) { setIsSubtopic(true); }
    console.log('HANDLE QUIZ CLICKED');
    console.log(
      showQuizContent,
      currentLesson,
      showLessonContent,
      lessonID,
      currentLesson
    );
  };

  const handleStartPreassessment = () => {
    navigate(`/preassessment?course_id=${courseId}`);
  };

  const handleExam = () => {
    setShowLessonContent(true);
    setShowQuizContent(false);
    setShowQuizResult(false);
    setShowExamContent(true);
    console.log('HANDLE EXAM CLICKED');
  };

  const handleToggleShowExamAttempts = () => {
    setShowExamAttempts(!showExamAttempts);
  };

  const closeShowExamAttempts = () => {
    setShowExamAttempts(false);
  }

  return (
    <div className="materials-page">
      {userType === "S" && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{Math.round(progress)}%</span>
            <span className="progress-icon">🏆</span>
          </div>
        </div>
      )}
      {!showLessonContent ? (
        <div className="lesson-content-container">
          <Syllabus
            lessons={lessons}
            onLessonClick={handleLessonClick}
            onTopicClick={handleTopicClick}
            onSubtopicClick={handleSubtopicClick}
            currentLesson={currentLesson}
            currentTopic={currentTopic}
            currentSubtopic={currentSubtopic}
            handleQuizClick={(lessonID: string, subtopicID: string, isSubtopic: boolean) => handleQuizClick(lessonID, subtopicID, isSubtopic)}
            hasPreassessment={hasPreassessment}
            courseId={courseId}
          />
          {userType == "S" && !hasPreassessment ? (
            <button
              className="preassessment-button"
              onClick={handleStartPreassessment}
            >
              Take preassessment
            </button>
          ) : userType == "S" && hasQuiz && (
            <>
              <button className="preassessment-button" onClick={handleExam}>
                Take exam
              </button>
              {hasExam && (
                <button className="attempts-button" onClick={handleToggleShowExamAttempts}>
                  Show Exam Attempts
                </button>
              )}
            </>
          )}
        </div>
      ) :
        <div className="lesson-content-container">
          <button className="btn-mat" onClick={handleBackButtonClick}>
            {currentPage === 1 ? "Go Back" : "Back to Syllabus"}
          </button>

          { !showQuizContent && !showExamContent && (
            <button
            className="btn-more-materials"
            onClick={handleMoreMaterialsClick}
          >
            More Materials
          </button>
          )}

          { !showQuizContent && !showExamContent && (
          <div className="filter-container">
            <h3 className='block-type-label-two'>Filter Content</h3>
            <div className="filter-options">
              <div
                className={`filter-button ${filterType.size === 0 ? "selected" : ""}`}
                onClick={() => setFilterType(new Set())}
              >
                All
              </div>
              {[
                { value: "lesson", label: "Lesson" },
                { value: "example", label: "Example" },
                { value: "case study", label: "Case Study" },
                { value: "practice", label: "Practice" },
              ].map((filter) => (
                <div
                  key={filter.value}
                  className={`filter-button ${
                    filterType.has(filter.value) ? "selected" : ""
                  }`}
                  onClick={() => {
                    const newFilterType = new Set(filterType);
                    if (filterType.has(filter.value)) {
                      newFilterType.delete(filter.value);
                    } else {
                      newFilterType.add(filter.value);
                    }
                    setFilterType(newFilterType);
                  }}
                >
                  {filter.label}
                </div>
              ))}
            </div>
          </div>
          )}


          {!showExamContent && !showQuizContent && currentPage === 0 && renderObjectives()}

          {!showQuizContent &&
            !showExamContent &&
            pages[currentPage] &&
            pages[currentPage]?.content_blocks
            .filter(
              (block: ContentBlock) =>
                filterType.size === 0 || filterType.has(block.block_type)
            )
            .sort((a, b) => {
              if (a.block_type === "lesson" && b.block_type !== "lesson") return -1;
              if (a.block_type !== "lesson" && b.block_type === "lesson") return 1;
              return 0;
            })
            .map((block: ContentBlock, idx: number) => (
              <div className="tiptap-content" key={idx}>
                <TipTapEditor
                  key={idx}
                  content={block.content}
                  editable={false}
                  hideToolbar
                />
              </div>
            ))}



          {!showQuizContent && !showExamContent && pageCount > 1 && showLessonContent && (
            <ReactPaginate
              previousLabel={""}
              nextLabel={""}
              breakLabel={""}
              pageCount={1}
              onPageChange={handleMaterialsPageClick}
              containerClassName={"materials-pagination"}
              activeClassName={"materials-active"}
              forcePage={0}
            />
          )}

          {showQuizContent && (
            <QuizContent
              lessonId={currentLesson}
              studentId={studentId}
              classInstanceId={classId}
              onTryAgain={handleTryAgain}
              onNextLesson={handleNextLesson}
              objectives={objectives}
              isSubtopic={isSubtopic}
              subtopicId={quizSubtopicId}
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
        </div>
      }

      {/*
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
          )} */}

      {/* {showQuizResult && quizResult && (
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
      )} */}

      {showExamAttempts && (
        <div className="modal-mastery-overlay-exam">
          <div className="modal-mastery-exam">
          <button className="close-btn" onClick={closeShowExamAttempts}>
              X
            </button>
          { showExamAttemptQuestions && (
            <>
              <button onClick={handleCloseViewQuestions} className='btn-mat'>Back</button>
              <div className="questions-review">
              {questions.map((question, index) => {
                return (
                  <div
                    key={question.id}
                    className='question-body-exam'
                  >
                    <h3>Question {index + 1}</h3>
                    <p className='question-exam-p'>{question.text}</p>
                    <ul>
                      {question.choices.map((choice) => {
                        return (
                          <li
                            key={choice.id}
                            className='question-exam-li'
                          >
                            {choice.text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
            </>
          )}
           { !showExamAttemptQuestions && (
            <>
          <h3>Exam Attempts</h3>
            <ul className='exam-ul'>
              <li className='exam-li'>
                <span className="exam-attempt-header">Date</span>
                <span className="exam-attempt-header">Score</span>
                <span className="exam-attempt-header">Time Taken</span>
                <span className="exam-attempt-header"></span>
              </li>
              {examAttempts.map((attempt, idx) => (
                <li className='exam-li' key={idx}>
                  <span>{attempt.start_time.getUTCMonth() + 1}/
                    {attempt.start_time.getUTCDate()}/
                    {attempt.start_time.getUTCFullYear()}</span>
                  <span>{attempt.score}</span>
                  <span>{Math.floor((attempt.end_time.getTime() - attempt.start_time.getTime()) / 60000)} minutes</span>
                  <button className="btn-more-materials" onClick={() => handleViewQuestions(attempt.questions)}>View Questions</button>
                </li>
              ))}
            </ul>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Materials;
