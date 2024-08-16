import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import "../styles/quiz-attempts.scss";

interface QuizAttempt {
  student: string;
  score: number;
  passed: boolean;
}

interface QuizAttemptsTableProps {
  lessonId: string;
  classInstanceId: number;
}

const QuizAttemptsTable: React.FC<QuizAttemptsTableProps> = ({
  lessonId,
  classInstanceId,
}) => {
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const response = await axiosInstance.get(
          `/quizzes/class/?lesson_id=${lessonId}&class_id=${classInstanceId}`
        );
        setQuizAttempts(response.data);
      } catch (err) {
        console.error("Error fetching quiz attempts:", err);
      }
    };

    fetchQuizAttempts();
  }, [lessonId, classInstanceId]);

  return (
    <div className="quiz-attempts-table">
      <h2>Quiz Attempts</h2>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Score</th>
            <th>Passed</th>
          </tr>
        </thead>
        <tbody>
          {quizAttempts.map((attempt, index) => (
            <tr key={index}>
              <td>{attempt.student}</td>
              <td>{attempt.score}</td>
              <td>{attempt.passed ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuizAttemptsTable;
