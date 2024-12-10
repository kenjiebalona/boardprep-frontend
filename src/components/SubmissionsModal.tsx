import React from "react";
import SubmissionCard from "./SubmissionCard";
import "../styles/submissionsmodal.scss";

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

interface SubmissionsModalProps {
  closeSubmissionModal: () => void;
  activityPoints: number;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

function SubmissionsModal({
  closeSubmissionModal,
  submissions,
  activityPoints,
  setSubmissions,
}: SubmissionsModalProps) {
  return (
    <div id="modal" className="modal">
      <div className="submission-modal">
        <div className="modal-header">
          <div className="h1">Submissions</div>
          <span className="close" onClick={closeSubmissionModal}>
            &times;
          </span>
        </div>
        <div className="submission-container">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <SubmissionCard
                submission={submission}
                activityPoints={activityPoints}
                setCurrentSubmissions={setSubmissions}
              />
            ))
          ) : (
            <div className="no-submissions">No submissions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionsModal;
