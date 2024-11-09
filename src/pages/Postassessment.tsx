import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ChallengeContent from "../components/ChallengeContent";
import { selectUser } from "../redux/slices/authSlice";
import { useSearchParams } from "react-router-dom";
import "../styles/daily-challenge.scss";
import DailyChallengeCard from "../components/DailyChallengeCard";
import dailychallenge from "../assets/daily-challenge.png";
import CardLeaderboard from "../components/CardLeaderboard";
import PreassessmentContent from "../components/PreassessmentContent";
import axiosInstance from "../axiosInstance";

interface Class {
  classId: number;
  className: string;
  classDescription: string;
  teacher_name: string;
  course: string;
  image: string;
  students: string[];
  classCode: string;
}

const Postassessment: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("course_id") || "";
  const { token } = useSelector(selectUser);
  const studentId = token?.id || "";
  const [classes, setClasses] = useState<Class[]>([]);

  const [testStarted, setTestStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleStartChallenge = () => {
    // setTestStarted(true);
    console.log("CLASSES: ", classes)
  };

  const handleDone = () => {
    setTestStarted(false);
    setResetKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(
        `/classes/?student_id=${studentId}`
      );
      setClasses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="daily-challenge-page">
      {!testStarted && (
        <>
          <DailyChallengeCard
            title="MOCKT EST"
            description="Try taking a mock test."
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
          <CardLeaderboard studentId={studentId} showTimeTaken={true} />
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

export default Postassessment;
