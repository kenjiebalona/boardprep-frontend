import React, { useState } from "react";
import { useSelector } from "react-redux";
import ChallengeContent from "../components/ChallengeContent";
import { selectUser } from "../redux/slices/authSlice";
import "../styles/daily-challenge.scss";
import DailyChallengeCard from "../components/DailyChallengeCard";
import dailychallenge from '../assets/daily-challenge.png';
import CardLeaderboard from "../components/CardLeaderboard";

const DailyChallenge: React.FC = () => {
  const { token } = useSelector(selectUser);
  const studentId = token?.id || "";

  const [challengeStarted, setChallengeStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleStartChallenge = () => {
    setChallengeStarted(true);
  };

  const handleDone = () => {
    setChallengeStarted(false);
    setResetKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="daily-challenge-page">
      {!challengeStarted && (
        <>
          <DailyChallengeCard
            title="DAILY CHALLENGE"
            description="Complete today's challenge and unlock the next lesson."
            descriptionPart2="Stay on track and keep improving!"
            buttonText="Start Challenge"
            image={dailychallenge}
            color={{
              backGround: "#29273C",
              boxShadow: "0px 5px 10px 0px #e0c6f5",
            }}
            className="challengeCard"
            imageClassName="challengeImage"
            onButtonClick={handleStartChallenge}
          />
          <CardLeaderboard studentId={studentId} showTimeTaken={true} />
        </>
      )}
      {challengeStarted && (
        <ChallengeContent
          key={resetKey}
          studentId={studentId}
          onDone={handleDone}
        />
      )}
    </div>
  );
};

export default DailyChallenge;
