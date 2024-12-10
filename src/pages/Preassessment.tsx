import React, { useState } from "react";
import { useSelector } from "react-redux";
import ChallengeContent from "../components/ChallengeContent";
import { selectUser } from "../redux/slices/authSlice";
import { useSearchParams } from "react-router-dom";
import "../styles/daily-challenge.scss";
import DailyChallengeCard from "../components/DailyChallengeCard";
import dailychallenge from "../assets/daily-challenge.png";
import CardLeaderboard from "../components/CardLeaderboard";
import PreassessmentContent from "../components/PreassessmentContent";

const Preassessment: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("course_id") || "";
  const { token } = useSelector(selectUser);
  const studentId = token?.id || "";

  const [testStarted, setTestStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleStartChallenge = () => {
    setTestStarted(true);
  };

  const handleDone = () => {
    setTestStarted(false);
    setResetKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="daily-challenge-page">
      {!testStarted && (
        <>
          <DailyChallengeCard
            title="PRE ASSESSMENT"
            description="Answer pre-assessment."
            descriptionPart2="Stay on track and keep improving!"
            buttonText="Start the Exam"
            image={dailychallenge}
            color={{
              backGround: "#29273C",
              boxShadow: "0px 5px 10px 0px #e0c6f5",
            }}
            className="challengeCard"
            imageClassName="challengeImage"
            onButtonClick={handleStartChallenge}
          />
          {/* <CardLeaderboard studentId={studentId} showTimeTaken={true} /> */}
        </>
      )}
      {testStarted && (
        <PreassessmentContent
          key={resetKey}
          studentId={studentId}
          onDone={handleDone}
          courseId={courseId}
        />
      )}
    </div>
  );
};

export default Preassessment;
