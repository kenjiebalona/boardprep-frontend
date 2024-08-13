import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import ChallengeResult from "./ChallengeResult";
import "../styles/challenge-content.scss";
import axios, { AxiosError } from "axios";

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

interface Challenge {
  id: string;
  title: string;
  questions: Question[];
}

interface StudentChallengeAttempt {
  leaderboardID: string;
  daily_challenge: string;
  score: number;
  total_questions: number;
  start_time: string;
  end_time?: string;
}

interface ChallengeContentProps {
  studentId: string;
  onDone: () => void;
}

const ChallengeContent: React.FC<ChallengeContentProps> = ({
  studentId,
  onDone,
}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [attempt, setAttempt] = useState<StudentChallengeAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flags, setFlags] = useState<{ [questionId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ [questionId: string]: boolean }>({});

  const questionsPerPage = 2;

  useEffect(() => {
    const fetchChallengeAndAttempt = async () => {
      try {
        console.log("Fetching today's challenge...");
        const challengeResponse = await axiosInstance.get(`/challenges/today/`);
        const challengeData = challengeResponse.data;

        console.log("Challenge data fetched:", challengeData);

        const challengeId = challengeData.challengeID;
        if (!challengeId) {
          throw new Error("Challenge ID is missing from the challenge data.");
        }

        console.log("Fetching all attempts for student:", studentId);
        const allAttemptsResponse = await axiosInstance.get(
          `/studentChallengeAttempt/?student_id=${studentId}`
        );
        const allAttempts = allAttemptsResponse.data;

        console.log("All attempts data fetched:", allAttempts);

        let attemptData = allAttempts.find(
          (attempt: any) => attempt.daily_challenge === challengeId
        );

        if (!attemptData || attemptData.end_time) {
          console.log("No active attempt found. Creating a new attempt...");
          const payload = {
            daily_challenge: challengeId,
            total_questions: challengeData.questions.length,
            student: studentId,
            score: 0,
          };

          const createAttemptResponse = await axiosInstance.post(
            "/studentChallengeAttempt/",
            payload
          );
          attemptData = createAttemptResponse.data;
          console.log("New attempt created:", attemptData);
        } else {
          console.log("Existing attempt found:", attemptData);
        }

        setChallenge(challengeData);
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

    fetchChallengeAndAttempt();
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
    try {
      if (!attempt?.leaderboardID) {
        console.error("Attempt ID is undefined. Aborting submission.");
        return;
      }

      const answersPayload = Object.entries(answers).map(
        ([questionId, choiceId]) => ({
          student: studentId,
          question: questionId,
          selected_choice: choiceId,
          challenge_attempt: attempt.leaderboardID,
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
          "/studentChallengeAttempt/calculate_score/",
          {
            attempt_id: attempt.leaderboardID,
          }
        );

        if (scoreResponse.status === 200) {
          const { score, total_questions, passed } = scoreResponse.data;
          setAttempt((prevAttempt) =>
            prevAttempt ? { ...prevAttempt, score, passed } : null
          );
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
      console.error("Error submitting challenge or calculating score:", error);
    }
  };

  const handleDone = () => {
    console.log("Challenge completed!");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!challenge || !attempt) {
    return <div>Error loading challenge or attempt</div>;
  }

  const totalPages = Math.ceil(challenge.questions.length / questionsPerPage);
  const displayedQuestions = challenge.questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <div className="challenge-content">
      {showResults ? (
        <ChallengeResult
            questions={challenge.questions}
            answers={answers}
            results={results}
            score={attempt.score}
            totalQuestions={challenge.questions.length}
            onDone={onDone} 
        />
      ) : (
        <>
          <h2>DAILY CHALLENGE</h2>
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
                {challenge.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`question-number ${
                      answers[challenge.questions[index].id] ? "answered" : ""
                    } ${
                      flags[challenge.questions[index].id] ? "flagged-box" : ""
                    }`}
                    onClick={() =>
                      handlePageChange(
                        Math.floor(index / questionsPerPage) + 1
                      )
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
    </div>
  );
};

export default ChallengeContent;
