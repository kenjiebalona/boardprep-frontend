import React, { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import "../styles/quiz-result.scss";
import axios from "axios";
import Analytics from "./Analytics";

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

interface ExamResultProps {
  examId: string;
  questions: Question[];
  answers: { [questionId: string]: string };
  results: { [questionId: string]: boolean };
  feedback: string | null;
  score: number;
  totalQuestions: number;
  passed: boolean;
  analytics: AnalyticsProps | null;
  onTryAgain: () => void;
  onNextLesson: () => void;
}

const ExamResult: React.FC<ExamResultProps> = ({
  examId,
  questions,
  answers,
  results,
  score,
  totalQuestions,
  passed,
  feedback,
  analytics,
  onTryAgain,
  onNextLesson
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleToggleFeedback = () => {
    setShowFeedback(!showFeedback);
  };

  const percentage = (score / totalQuestions) * 100;

  return (
    <div className="quiz-result">
      <h2>Exam Results</h2>
      <div className={`results-card ${passed ? "passed" : "failed"}`}>
        <div className="results-summary">
          <div className="progressbar-container">
            <CircularProgressbar
              value={percentage}
              text={`${score} / ${totalQuestions}`}
              styles={{
                path: {
                  stroke: passed ? "#4caf50" : "#f44336",
                },
                text: {
                  fill: "black",
                  fontSize: '16px',
                },
                trail: {
                  stroke: '#d6d6d6',
                },
              }}
            />
          </div>
          <p>{passed ? "Congratulations, you passed the exam!" : "You did not pass. Try again!"}</p>
        </div>
        <button className="view-results-button" onClick={handleToggleDetails}>
          {showDetails ? "Hide Details" : "View Results"}
        </button>
        {showDetails && (
          <div className="questions-review">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = results[question.id];
              const highlightColor = isCorrect ? "#4caf50" : "#f44336";

              return (
                <div
                  key={question.id}
                  className={`question-result ${isCorrect ? "correct" : "incorrect"}`}
                  style={{ borderColor: highlightColor }}
                >
                  <h3>Question {index + 1}</h3>
                  <p>{question.text}</p>
                  <ul>
                    {question.choices.map((choice) => {
                      const isSelected = userAnswer === choice.id;
                      return (
                        <li
                          key={choice.id}
                          className={isSelected ? "selected-choice" : ""}
                          style={{ backgroundColor: isSelected ? highlightColor : "transparent" }}
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
        )}
        <div className="quiz-result-buttons">
          {!passed && (
            <button className="view-results-button" onClick={onTryAgain}>
              Go Back To The Lessons
            </button>
          )}
          {passed && (
            <button className="view-results-button" onClick={onNextLesson}>
              Done
            </button>
          )}
          <button
            className="view-results-button-two"
            onClick={handleToggleFeedback}
            disabled={loadingFeedback}
          >
            {showFeedback ? "Hide Feedback" : "View Feedback"}
          </button>
        </div>
        {showFeedback && feedback && (
          <div className="feedback-section">
            <h3>Feedback</h3>
            <p>{feedback}</p>
          </div>
        )}
        {
          analytics && showFeedback && <Analytics analytics={analytics} />
        }
      </div>
    </div>
  );
};

export default ExamResult;
