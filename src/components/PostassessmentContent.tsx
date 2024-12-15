import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import PostassessmentResult from "./PostassessmentResult";
import "../styles/challenge-content.scss";
import axios, { AxiosError } from "axios";
import Loader from "./Loader";

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

interface Mocktest {
  id: string;
  title: string;
  questions: Question[];
}

interface StudentMocktestAttempt {
  mocktestID: string;
  mocktest: string;
  score: number;
  total_questions: number;
  start_time: string;
  end_time?: string;
}

interface MocktestContentProps {
  studentId: string;
  onDone: () => void;
  courseId: string;
}

interface PerformanceTrends {
  strong_learning_objectives: string[];
  weak_learning_objectives: string[];
  hardest_difficulty: [string, number] | null;
  easiest_difficulty: [string, number] | null;
}

interface TimeSpent {
  total_time: number;
  average_time_per_question: number;
}

interface DifficultyAnalysis {
  correct: Record<number, number>;
  wrong: Record<number, number>;
}

interface AnalyticsProps {
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score_percentage: number;
  time_spent: TimeSpent;
  difficulty_analysis: DifficultyAnalysis;
  performance_trends: PerformanceTrends;
}

const PostassessmentContent: React.FC<MocktestContentProps> = ({
  studentId,
  onDone,
  courseId,
}) => {
  const [mocktest, setMocktest] = useState<Mocktest | null>(
    null
  );
  const [attempt, setAttempt] = useState<StudentMocktestAttempt | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flags, setFlags] = useState<{ [questionId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ [questionId: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsProps | null>(null);

  const questionsPerPage = 3;

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchMocktestAndAttempt = async () => {
      try {
        console.log("Fetching mocktest...");
        const mocktestResponse = await axiosInstance.get(
          `/mocktest/today/`
        );
        const mocktestData = mocktestResponse.data;

        console.log("Mocktest data fetched:", mocktestData);

        mocktestData.questions = shuffleArray(mocktestData.questions);

        const mocktestID = mocktestData.mocktestID;
        if (!mocktestID) {
          throw new Error(
            "Mocktest ID is missing from the mocktest data."
          );
        }

        setMocktest(mocktestData);
        console.log(`Student ID: ${studentId}`);

        console.log("Fetching all attempts for student:", studentId);
        const allAttemptsResponse = await axiosInstance.get(
          `/studentMocktestAttempt/?student_id=${studentId}&course_id=${courseId}`
        );
        const allAttempts = allAttemptsResponse.data;

        console.log("All attempts data fetched:", allAttempts);

        let attemptData = allAttempts.find(
          (attempt: any) => attempt.daily_challenge === mocktestID
        );

        if (!attemptData || attemptData.end_time) {
          console.log("No active attempt found. Creating a new attempt...");
          const payload = {
            mocktest: mocktestID,
            total_questions: mocktestData.questions.length,
            student: studentId,
            score: 0,
          };

          console.log(`mocktestID: ${mocktestID}`);
          const createAttemptResponse = await axiosInstance.post(
            "/studentMocktestAttempt/",
            payload
          );
          attemptData = createAttemptResponse.data;
          console.log("New attempt created:", attemptData);
        } else {
          console.log("Existing attempt found:", attemptData);
        }
        setIsLoading(false);
        setAttempt(attemptData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Response error:", error.response?.data);
        } else if (error instanceof Error) {
          console.error("Error message:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMocktestAndAttempt();
  }, [studentId]);

  const handleAnswerChange = (questionId: string, choiceId: string) => {
    setAnswers({
      ...answers,
      [questionId]: choiceId,
    });
  };

  const handleFlagToggle = (questionId: string) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      [questionId]: !prevFlags[questionId],
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!attempt?.mocktestID) {
        console.error("Attempt ID is undefined. Aborting submission.");
        return;
      }

      const answersPayload = Object.entries(answers).map(
        ([questionId, choiceId]) => ({
          student: studentId,
          question: questionId,
          selected_choice: choiceId,
          mocktest_attempt: attempt.mocktestID,
        })
      );

      console.log("answersPayload:", answersPayload);

      const postAnswersResponse = await axiosInstance.post(
        "/studentAnswers/",
        answersPayload
      );

      if (postAnswersResponse.status === 201) {
        const resultsData = postAnswersResponse.data.reduce(
          (acc: { [key: string]: boolean }, item: any) => {
            acc[item.question] = item.is_correct;
            return acc;
          },
          {}
        );

        const scoreResponse = await axiosInstance.post(
          "/studentMocktestAttempt/calculate_score/",
          {
            attempt_id: attempt.mocktestID,
          }
        );

        if (scoreResponse.status === 200) {
          const { score, total_questions, passed, feedback, analytics } = scoreResponse.data;
          setAttempt((prevAttempt) =>
            prevAttempt ? { ...prevAttempt, score, passed } : null
          );
          setFeedback(feedback);
          setAnalytics(analytics);
          setResults(resultsData);
          setShowResults(true);
        }
      } else {
        console.error(
          "Failed to submit answers. Status code:",
          postAnswersResponse.status
        );
      }
    } catch (error) {
      console.error(
        "Error submitting mocktest or calculating score:",
        error
      );
    }
  };

  const handleDone = () => {
    console.log("Mocktest completed!");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!mocktest || !attempt) {
    return <div>Error loading mocktest or attempt</div>;
  }

  const totalPages = Math.ceil(
    mocktest.questions.length / questionsPerPage
  );
  const displayedQuestions = mocktest.questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <div className="challenge-content">
      {showResults ? (
        <PostassessmentResult
          questions={mocktest.questions}
          answers={answers}
          results={results}
          score={attempt.score}
          totalQuestions={mocktest.questions.length}
          onDone={onDone}
          feedback={feedback}
          analytics={analytics}
        />
      ) : (
        <>
          { isLoading ? (
            <Loader />
          ) : (

          <>
          <h2>MOCK TEST</h2>
          <div className="challenge-body">
            <div className="questions-section">
              {displayedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={`question-block ${
                    flags[question.id] ? "flagged" : ""
                  }`}
                >
                  <p>
                    {(currentPage - 1) * questionsPerPage + index + 1}.{" "}
                    {question.text}
                  </p>
                  <button
                    className="flag-button"
                    onClick={() => handleFlagToggle(question.id)}
                  >
                    🚩
                  </button>
                  <ul>
                    {question.choices.map((choice) => (
                      <li key={choice.id}>
                        <label>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={choice.id}
                            checked={answers[question.id] === choice.id}
                            onChange={() =>
                              handleAnswerChange(question.id, choice.id)
                            }
                          />
                          {choice.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="right-panel">
              <div className="question-nav">
                {mocktest.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`question-number ${
                      answers[mocktest.questions[index].id]
                        ? "answered"
                        : ""
                    } ${
                      flags[mocktest.questions[index].id]
                        ? "flagged-box"
                        : ""
                    }`}
                    onClick={() =>
                      handlePageChange(Math.floor(index / questionsPerPage) + 1)
                    }
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="actions">
                <button className="submit-button" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
          </>
          )}
        </>
      )}
    </div>
  );
};

export default PostassessmentContent;
