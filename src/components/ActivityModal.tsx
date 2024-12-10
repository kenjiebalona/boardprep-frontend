import React, { useRef, useState } from "react";
import "../styles/activitymodal.scss";
import { MdAttachFile } from "react-icons/md";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import Attachment from "./Attachment";
import ErrorCard from "./ErrorCard";
import axiosInstance from "../axiosInstance";

interface ActivityModalProps {
  closeModal: () => void;
  classId?: number;
  setActivities?: React.Dispatch<React.SetStateAction<Activity[]>>;
  activity?: Activity;
  setActivityDetails?: React.Dispatch<
    React.SetStateAction<Activity | undefined>
  >;
}

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

function ActivityModal({
  closeModal,
  classId,
  setActivities,
  activity,
  setActivityDetails,
}: ActivityModalProps) {
  const user = useAppSelector(selectUser);
  const [aType, setAType] = useState("file");
  const [file, setFile] = useState<File | null>();
  const [attachments, setAttachments] = useState<Attachments[]>([]);
  const [error, setError] = useState<string>("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [title, setTitle] = useState<string>(activity ? activity.title : "");
  const [description, setDescription] = useState<string>(
    activity ? activity.content : ""
  );

  const formatDateTimeForBackend = (datetime: string) => {
    if (!datetime) return "";
    const dateObj = new Date(datetime);
    dateObj.setHours(dateObj.getHours() + 8);
    const formattedDate = dateObj.toISOString().slice(0, 16);

    return formattedDate;
  };

  const [start, setStart] = useState<string>(
    formatDateTimeForBackend(activity ? activity.start_date : "")
  );
  const [endDate, setEnd] = useState<string>(
    formatDateTimeForBackend(activity ? activity.due_date : "")
  );
  const [points, setPoints] = useState<number>(activity ? activity.points : 0);
  const linkRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createActivity();
  };

  const createActivity = async () => {
    const attachs = attachments.map((attachment) => attachment.id);
    const data = {
      title,
      content: description,
      start_date: start,
      due_date: endDate,
      status: "Not Started",
      points,
      class_instance: classId,
      teacher: user.token.id,
      attachments: attachs,
    };
    try {
      if (activity) {
        const response = await axiosInstance.put(
          `/activities/${activity.id}/`,
          data
        );
        if (setActivityDetails) {
          setActivityDetails(response.data);
        }
      } else {
        const response = await axiosInstance.post("/activities/", data);
        if (setActivities)
          setActivities((prevActivities) => [...prevActivities, response.data]);
      }
      closeModal();
    } catch (err: any) {
      const data = err.response.data;
      if (data.error) {
        setError(data.error);
      }
      const error = data.match(/(?<=exception_value">).*(?=<\/pre>)/);
      setError(error[0]);
    }
  };

  const handleChangeAType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAType(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const addAttachment = async () => {
    if (aType === "link" && !linkRef.current?.value)
      return setError("Link is required");
    try {
      const formData = new FormData();
      if (aType === "file") {
        if (file) {
          formData.append("file", file);
          formData.append("user", user.token.id);
          const response = await axiosInstance.post("/attachments/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          setAttachments([...attachments, response.data]);
          setFile(null);
        }
      } else {
        formData.append("link", linkRef.current?.value as string);
        formData.append("user", user.token.id);
        const response = await axiosInstance.post("/attachments/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setAttachments([...attachments, response.data]);
        linkRef.current!.value = "";
      }
    } catch (err: any) {
      const data = err.response.data;
      setError(data["link"][0]);
    }
  };

  const handleAddAttachment = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    addAttachment();
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (
      isFormDirty &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      )
    )
      return;
    if (attachments.length > 0) {
      attachments.forEach(async (attachment) => {
        try {
          await axiosInstance.delete(`/attachments/${attachment.id}/`);
        } catch (err) {
          console.error(err);
        }
      });
    }
    closeModal();
  };

  const handleFormChange = () => {
    setIsFormDirty(true);
  };

  return (
    <div id="modal" className="modal">
      <div className="activity-modal">
        <div className="modal-header">
          <div className="h1">Create Activity</div>
          <span className="close" onClick={handleCloseClick}>
            &times;
          </span>
        </div>
        {error && <ErrorCard message={error} />}
        <form
          className="activity-form"
          onSubmit={handleSubmit}
          onChange={handleFormChange}
        >
          <div className="half">
            <div className="left-half">
              <label htmlFor="title">Activity Title</label>
              <input
                type="text"
                id="title"
                placeholder="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label htmlFor="content">Activity Content</label>
              <textarea
                placeholder="Activity Content"
                id="content"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <label htmlFor="start">Start Date</label>
              <input
                type="text"
                id="start"
                placeholder="Start Date"
                onFocus={(e) => (e.target.type = "datetime-local")}
                onBlur={(e) => (e.target.type = "text")}
                min={new Date().toISOString().slice(0, 16)}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="right-half">
              <label htmlFor="end">End Date</label>
              <input
                type="text"
                id="end"
                placeholder="End Date"
                onFocus={(e) => (e.target.type = "datetime-local")}
                onBlur={(e) => (e.target.type = "text")}
                value={endDate}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
              <label htmlFor="points">Points</label>
              <input
                type="number"
                id="points"
                placeholder="Points"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
              />
              <label htmlFor="attachments">Attachments</label>
              <div id="attachments">
                {attachments.map((attachment) => (
                  <Attachment
                    attachment={attachment}
                    setAttachments={setAttachments}
                  />
                ))}
              </div>
              <div className="radios" onChange={handleChangeAType}>
                <input
                  type="radio"
                  name="attachtype"
                  id="file"
                  value="file"
                  defaultChecked
                />
                <label htmlFor="file">File</label>
                <input type="radio" name="attachtype" id="link" value="link" />
                <label htmlFor="file">Link</label>
              </div>
              {aType === "file" ? (
                <input type="file" id="file" onChange={handleFileChange} />
              ) : (
                <input type="text" id="link" placeholder="Link" ref={linkRef} />
              )}
              <div className="add-attachment" onClick={handleAddAttachment}>
                <MdAttachFile />
                Add Attachment
              </div>
            </div>
          </div>
          <button type="submit">
            {activity ? "Update Activity" : "Create Activity"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ActivityModal;
