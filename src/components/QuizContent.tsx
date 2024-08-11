import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import QuizResult from "./QuizResult";
import "../styles/quiz-content.scss";

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

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface StudentQuizAttempt {
  id: string;
  quiz: string;
  score: number | null;
  total_questions: number;
  start_time: string;
  end_time: string | null;
  passed: boolean;
}

interface QuizContentProps {
  studentId: string;
  lessonId: string;
}

const QuizContent: React.FC<QuizContentProps> = ({ studentId, lessonId }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<StudentQuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flags, setFlags] = useState<{ [questionId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ [questionId: string]: boolean }>({});

  const questionsPerPage = 2;

  useEffect(() => {
    const fetchQuizAndAttempt = async () => {
      try {
        const quizResponse = await axiosInstance.get(`/quizzes/?student_id=${studentId}&lesson_id=${lessonId}`);
        let quizData = quizResponse.data[0];

        if (!quizData) {
          const createQuizResponse = await axiosInstance.post("/quizzes/", {
            student: studentId,
            lesson: lessonId,
            title: `Lesson ${lessonId} Quiz`,
          });
          quizData = createQuizResponse.data;
        }

        setQuiz(quizData);

        const attemptResponse = await axiosInstance.get(`/studentQuizAttempt/?quiz_id=${quizData.id}`);
        let attemptData = attemptResponse.data[0];

        if (!attemptData) {
          const createAttemptResponse = await axiosInstance.post("/studentQuizAttempt/", {
            quiz: quizData.id,
            total_questions: quizData.questions.length,
          });
          attemptData = createAttemptResponse.data;
        }

        setAttempt(attemptData);
      } catch (error) {
        console.error("Error fetching quiz and attempt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndAttempt();
  }, [studentId, lessonId]);

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
      const answersPayload = Object.entries(answers).map(([questionId, choiceId]) => {
        return {
          student: studentId,
          question: questionId,
          selected_choice: choiceId,
          quiz_attempt: attempt?.id,
        };
      });

      const postAnswersResponse = await axiosInstance.post("/studentAnswers/", answersPayload);

      if (postAnswersResponse.status === 201) {
        const resultsData = postAnswersResponse.data.reduce((acc: { [key: string]: boolean }, item: any) => {
          acc[item.question] = item.is_correct;
          return acc;
        }, {});

        const scoreResponse = await axiosInstance.post("/studentQuizAttempt/calculate_score/", {
          attempt_id: attempt?.id,
        });

        if (scoreResponse.status === 200) {
          const { score, total_questions, passed } = scoreResponse.data;
          setAttempt((prevAttempt) => prevAttempt ? { ...prevAttempt, score, passed } : null);
          setResults(resultsData);
          setShowResults(true);
        }
      } else {
        console.error("Failed to submit answers. Status code:", postAnswersResponse.status);
      }
    } catch (error) {
      console.error("Error submitting quiz or calculating score:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quiz || !attempt) {
    return <div>Error loading quiz or attempt</div>;
  }

  const totalPages = Math.ceil(quiz.questions.length / questionsPerPage);
  const displayedQuestions = quiz.questions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage);

  return (
    <div className="quiz-content">
      {showResults ? (
        <QuizResult
          questions={quiz.questions}
          answers={answers}
          results={results}
          score={attempt.score ?? 0}
          totalQuestions={quiz.questions.length}
          passed={attempt.passed ?? false}
        />
      ) : (
        <>
          <h2>{quiz.title}</h2>
          <div className="quiz-body">
            <div className="questions-section">
              {displayedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={`question-block ${flags[question.id] ? "flagged" : ""}`}
                >
                  <p>{(currentPage - 1) * questionsPerPage + index + 1}. {question.text}</p>
                  <button className="flag-button" onClick={() => handleFlagToggle(question.id)}>🚩</button>
                  <ul>
                    {question.choices.map((choice) => (
                      <li key={choice.id}>
                        <label>
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={choice.id}
                            checked={answers[question.id] === choice.id}
                            onChange={() => handleAnswerChange(question.id, choice.id)}
                          />
                          {choice.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="question-nav">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`question-number ${answers[quiz.questions[index].id] ? "answered" : ""} ${flags[quiz.questions[index].id] ? "flagged-box" : ""}`}
                  onClick={() => handlePageChange(Math.floor(index / questionsPerPage) + 1)}
                >
                  {index + 1}
                </div>
              ))}
              <button className="submit-button" onClick={handleSubmit}>Submit</button>
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

export default QuizContent;
