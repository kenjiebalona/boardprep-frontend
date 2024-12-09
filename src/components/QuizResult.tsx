import React, { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import "../styles/quiz-result.scss";

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

interface QuizResultProps {
  questions: Question[];
  answers: { [questionId: string]: string };
  results: { [questionId: string]: boolean };
  score: number;
  totalQuestions: number;
  passed: boolean;
  onTryAgain: () => void;
  onNextLesson: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  questions,
  answers,
  results,
  score,
  totalQuestions,
  passed,
  onTryAgain,
  onNextLesson,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const percentage = (score / totalQuestions) * 100;

  return (
    <div className="quiz-result">
      <h2>Quiz Results</h2>
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
          <p>{passed ? "Congratulations, you passed!" : "You did not pass. Try again!"}</p>
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
              Try Again
            </button>
          )}
          {passed && (
            <button className="view-results-button" onClick={onNextLesson}>
              Next Lesson
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
