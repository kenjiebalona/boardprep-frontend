import React, { useState } from "react";
import "../styles/submissioncard.scss";
import { convertToPHTime } from "../functions";
import { IoChevronForward, IoChevronDown } from "react-icons/io5";
import Attachment from "./Attachment";
import axiosInstance from "../axiosInstance";

interface Attachments {
  id: number;
  file: string;
  link: string;
  user: string;
  title: string;
  favicon: string;
}

interface Submission {
  id: number;
  submission_text: string;
  activity: number;
  student: string;
  student_name: string;
  submission_date: string;
  score: number;
  is_returned: boolean;
  feedback: string;
  attachments: number[];
  attachments_details: Attachments[];
}

interface SubmissionCardProps {
  submission: Submission;
  activityPoints: number;
  setCurrentSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

function SubmissionCard({
  submission,
  activityPoints,
  setCurrentSubmissions,
}: SubmissionCardProps) {
  const [openAttachments, setOpenAttachments] = useState(false);
  const [feedback, setFeedback] = useState<string>(submission.feedback);
  const [score, setScore] = useState<number>(submission.score);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const returnSubmission = async () => {
    if (score > activityPoints) return;

    try {
      const response = await axiosInstance.post(
        `/submissions/${submission.id}/score-submission/`,
        {
          score: score,
          feedback: feedback,
        }
      );
      setCurrentSubmissions((prevSubmissions) =>
        prevSubmissions.map((prevSubmission) =>
          prevSubmission.id === submission.id ? response.data : prevSubmission
        )
      );
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="submission-card" key={submission.id}>
      <div className="submission-card--header">
        <div className="submission-card--header__left">
          <div className="name">{submission.student_name}</div>
          <div className="date">
            Submitted on: {convertToPHTime(submission.submission_date)}
          </div>
        </div>
        <div className="submission-card--header__right">
          {submission.is_returned && !isEditing ? (
            submission.score
          ) : (
            <input
              type="number"
              max={activityPoints}
              value={score}
              onChange={(e) => setScore(e.target.valueAsNumber)}
            />
          )}{" "}
          / {activityPoints}
        </div>
      </div>
      <div className="submission-card--body">
        <div
          className="view"
          onClick={() => setOpenAttachments(!openAttachments)}
        >
          View Attachments{" "}
          {openAttachments ? <IoChevronDown /> : <IoChevronForward />}
        </div>
        {openAttachments &&
          submission.attachments.length > 0 &&
          submission.attachments_details.map((attachment) => (
            <Attachment attachment={attachment} />
          ))}
      </div>
      <div className="submission-card--feedback">
        <div className="feedback">Feedback</div>
        {submission.is_returned && !isEditing ? (
          <div className="feed">{submission.feedback}</div>
        ) : (
          <textarea
            name="feedback"
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        )}
      </div>
      <button
        onClick={() =>
          submission.is_returned && !isEditing
            ? setIsEditing(true)
            : returnSubmission()
        }
      >
        {submission.is_returned && !isEditing ? "Edit" : "Return"}
      </button>
    </div>
  );
}

export default SubmissionCard;
