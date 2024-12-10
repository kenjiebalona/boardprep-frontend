import React from "react";
import "../styles/activityrow.scss";
import { convertToPHTime } from "../functions";

interface Attachments {
  id: number;
  file: string;
  link: string;
  user: string;
  title: string;
  favicon: string;
}

interface Activity {
  id: number;
  className: string;
  title: string;
  content: string;
  start_date: string;
  due_date: string;
  status: string;
  points: number;
  created_at: string;
  class_instance: number;
  teacher: string;
  attachments_details: Attachments[];
}

interface ActivityRowProps {
  activity: Activity;
  setActivityDetails: React.Dispatch<
    React.SetStateAction<Activity | undefined>
  >;
}

function ActivityRow({ activity, setActivityDetails }: ActivityRowProps) {
  const statusColor =
    activity.status === "In Progress"
      ? "orange"
      : activity.status === "Completed"
      ? "#00d15e"
      : "grey";

  const handleRowClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setActivityDetails(activity);
  };

  return (
    <div className="activity-row" onClick={handleRowClick}>
      <div className="activity-row__header">
        <div className="activity-row__header--left">
          <div className="activity-row__header--left__title">
            {activity.title}
          </div>
          <div
            className="activity-row__header--left__status"
            style={{ background: statusColor }}
          >
            {activity.status}
          </div>
        </div>
        <div className="activity-row__header--points">
          {activity.points} pts
        </div>
      </div>
      <div className="activity-row__class">{activity.className}</div>
      <div className="activity-row__start">
        Starts {convertToPHTime(activity.start_date, true)}
      </div>
      <div className="activity-row__end">
        Closes {convertToPHTime(activity.due_date, true)}
      </div>
    </div>
  );
}

export default ActivityRow;
