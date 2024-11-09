import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import PostassessmentResult from "./PostassessmentResult";
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

interface Postassessment {
  id: string;
  title: string;
  questions: Question[];
}

interface StudentPostassessmentAttempt {
  postassessmentID: string;
  postassessment: string;
  score: number;
  total_questions: number;
  start_time: string;
  end_time?: string;
}

interface PostassessmentContentProps {
  studentId: string;
  onDone: () => void;
  courseId: string;
}

const PostassessmentContent: React.FC<PostassessmentContentProps> = ({
  studentId,
  onDone,
  courseId,
}) => {
  const [postassessment, setPostassessment] = useState<Postassessment | null>(
    null
  );
  const [attempt, setAttempt] = useState<StudentPostassessmentAttempt | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flags, setFlags] = useState<{ [questionId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ [questionId: string]: boolean }>({});

  const questionsPerPage = 3;

  useEffect(() => {
    const fetchPostassessmentAndAttempt = async () => {
      try {
        console.log("Fetching postassessment...");
        const postassessmentResponse = await axiosInstance.get(
          `/postassessment/today/?course_id=${courseId}`
        );
        const postassessmentData = postassessmentResponse.data;

        console.log("Postassessment data fetched:", postassessmentData);

        const postassessmentID = postassessmentData.postassessmentID;
        if (!postassessmentID) {
          throw new Error(
            "Postassessment ID is missing from the postassessment data."
          );
        }

        setPostassessment(postassessmentData);
        console.log(`Student ID: ${studentId}`);

        console.log("Fetching all attempts for student:", studentId);
        const allAttemptsResponse = await axiosInstance.get(
          `/studentPostassessmentAttempt/?student_id=${studentId}&course_id=${courseId}`
        );
        const allAttempts = allAttemptsResponse.data;

        console.log("All attempts data fetched:", allAttempts);

        let attemptData = allAttempts.find(
          (attempt: any) => attempt.daily_challenge === postassessmentID
        );

        if (!attemptData || attemptData.end_time) {
          console.log("No active attempt found. Creating a new attempt...");
          const payload = {
            postassessment: postassessmentID,
            total_questions: postassessmentData.questions.length,
            student: studentId,
            score: 0,
          };

          console.log(`postassessmentID: ${postassessmentID}`);
          const createAttemptResponse = await axiosInstance.post(
            "/studentPostassessmentAttempt/",
            payload
          );
          attemptData = createAttemptResponse.data;
          console.log("New attempt created:", attemptData);
        } else {
          console.log("Existing attempt found:", attemptData);
        }

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

    fetchPostassessmentAndAttempt();
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
      if (!attempt?.postassessmentID) {
        console.error("Attempt ID is undefined. Aborting submission.");
        return;
      }

      const answersPayload = Object.entries(answers).map(
        ([questionId, choiceId]) => ({
          student: studentId,
          question: questionId,
          selected_choice: choiceId,
          postassessment_attempt: attempt.postassessmentID,
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
          "/studentPostassessmentAttempt/calculate_score/",
          {
            attempt_id: attempt.postassessmentID,
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
      console.error(
        "Error submitting postassessment or calculating score:",
        error
      );
    }
  };

  const handleDone = () => {
    console.log("Postassessment completed!");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!postassessment || !attempt) {
    return <div>Error loading postassessment or attempt</div>;
  }

  const totalPages = Math.ceil(
    postassessment.questions.length / questionsPerPage
  );
  const displayedQuestions = postassessment.questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  return (
    <div className="challenge-content">
      {showResults ? (
        <PostassessmentResult
          questions={postassessment.questions}
          answers={answers}
          results={results}
          score={attempt.score}
          totalQuestions={postassessment.questions.length}
          onDone={onDone}
        />
      ) : (
        <>
          <h2>PRE-ASSESSMENT</h2>
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
                {postassessment.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`question-number ${
                      answers[postassessment.questions[index].id]
                        ? "answered"
                        : ""
                    } ${
                      flags[postassessment.questions[index].id]
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
    </div>
  );
};

export default PostassessmentContent;
