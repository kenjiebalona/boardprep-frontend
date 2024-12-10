import React, { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import "../styles/challenge-result.scss";

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

interface ChallengeResultProps {
  questions: Question[];
  answers: { [questionId: string]: string };
  results: { [questionId: string]: boolean };
  score: number;
  totalQuestions: number;
  onDone: () => void;
}

const ChallengeResult: React.FC<ChallengeResultProps> = ({
  questions,
  answers,
  results,
  score,
  totalQuestions,
  onDone,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const percentage = (score / totalQuestions) * 100;
  let message = "";
  let resultClass = "";

  if (percentage >= 90) {
    message = "You did great! Keep up the good work!";
    resultClass = "great";
  } else if (percentage >= 75) {
    message = "Not Bad, That's good.";
    resultClass = "good";
  } else {
    message = "You failed, better luck next time!";
    resultClass = "failed";
  }

  return (
    <div className="challenge-result">
      <h2>Challenge Results</h2>
      <div className={`results-card ${resultClass}`}>
        <div className="results-summary">
          <div className="progressbar-container">
            <CircularProgressbar
              value={percentage}
              text={`${score} / ${totalQuestions}`}
              styles={{
                path: {
                  stroke:
                    resultClass === "great"
                      ? "#4caf50"
                      : resultClass === "good"
                      ? "#ffa726"
                      : "#f44336",
                },
                text: {
                  fill: "black",
                  fontSize: "16px",
                },
                trail: {
                  stroke: "#d6d6d6",
                },
              }}
            />
          </div>
          <p>{message}</p>
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
                  className={`question-result ${
                    isCorrect ? "correct" : "incorrect"
                  }`}
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
                          style={{
                            backgroundColor: isSelected
                              ? highlightColor
                              : "transparent",
                          }}
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
        <div className="challenge-result-buttons">
          <button className="view-results-button" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeResult;
