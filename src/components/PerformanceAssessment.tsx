import React from 'react';
import '../styles/performanceAssessment.scss';

interface PerformanceAssessmentProps {
  score: number;
  totalScore: number;
  onClose: () => void;
  subjectsCount: number;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
  feedback: string;
}

const PerformanceAssessment: React.FC<PerformanceAssessmentProps> = ({
  score,
  totalScore,
  onClose,
  subjectsCount,
  easyPercentage,
  mediumPercentage,
  hardPercentage,
  feedback,
}) => {
  console.log("Subjects prop in PerformanceAssessment:", subjectsCount);
  const percentage = (score / totalScore) * 100;

  return (
    <div className="performance-assessment-popup">
      <div className="performance-assessment-content">
        <div className="assessment-header">
          <h2>PERFORMANCE ASSESSMENT</h2>
          <div className="score-section">
            <div className="score">
              <div className="scoreTitle">
                SCORE
              </div>
              <br/>
              <div className="scoreValue">
                  <b>{score}/{totalScore}</b>
              </div>
              <br/>
              <div className="scorePercentage">
                Percentage: <span className="scorePercent"><b>{percentage.toFixed(0)}%</b></span>
              </div>
            </div>
            <hr className="dividerTop"></hr>
            <div className="difficulty-percentages">
              <div className="difficultyEasy">
                EASY
                <span className="easyValue">
                  <b>{easyPercentage.toFixed(0)}%</b>
                </span>
              </div>
              <div className="difficultyMedium">
                MED
                <span className="medValue">
                  <b>{mediumPercentage.toFixed(0)}%</b>
                </span>
              </div>
              <div className="difficultyHard">
                HARD
                <span className="hardValue">
                  <b>{hardPercentage.toFixed(0)}%</b>
                </span>
              </div>
            </div>
            <hr className="dividerBottom"></hr>
          </div>
          <div className="subjects-section">
              <div className="subject">
                  SUBJECTS ENCOUNTERED: <b>{subjectsCount}</b>
              </div>
          </div>
        </div>
        <div className="feedback-section">
          <p className="feedback">
            <h2 className="feedbackTitle">Preppy's Feedback: </h2>
            <hr className="dividerFeedback"></hr>
            <br></br>
             {feedback.split('\n').map((line, index) => (
                <span key={index}>
                    {line}
                    <br />
                </span>
            ))}
          </p>
        </div>
        <div className="buttonDesign">
            <hr className="designBar"></hr><button onClick={onClose}><b>EXIT</b></button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAssessment;
