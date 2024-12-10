import React, { useState, useRef } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import "../styles/smallattachmentmodal.scss";
import ErrorCard from "./ErrorCard";
import axiosInstance from "../axiosInstance";

interface SmallAttachmentModalProps {
  closeModal: () => void;
  setSubAttachments: React.Dispatch<React.SetStateAction<any[]>>;
  isFile: boolean;
}

function SmallAttachmentModal({
  closeModal,
  setSubAttachments,
  isFile,
}: SmallAttachmentModalProps) {
  const user = useAppSelector(selectUser);
  const [file, setFile] = useState<File | null>();
  const [error, setError] = useState<string>("");
  const linkRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const addAttachment = async () => {
    try {
      const formData = new FormData();
      if (isFile) {
        if (file) {
          formData.append("file", file);
          formData.append("user", user.token.id);
          const response = await axiosInstance.post("/attachments/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          setSubAttachments((prevAttachments) => [
            ...prevAttachments,
            response.data,
          ]);
        }
      } else {
        formData.append("link", linkRef.current?.value as string);
        formData.append("user", user.token.id);
        const response = await axiosInstance.post("/attachments/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSubAttachments((prevAttachments) => [
          ...prevAttachments,
          response.data,
        ]);
      }
      closeModal();
    } catch (err: any) {
      const data = err.response.data;
      setError(data["link"][0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAttachment();
  };
  return (
    <div id="modal" className="modal">
      <div className="attachment-modal">
        <div className="modal-header">
          <div className="h1">Attach {isFile ? "File" : "Link"}</div>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
        </div>
        {error && <ErrorCard message={error} />}
        <form className="activity-form" onSubmit={handleSubmit}>
          <div className="half">
            <div className="right-half">
              {isFile ? (
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  required
                />
              ) : (
                <input
                  type="text"
                  id="link"
                  placeholder="Link"
                  ref={linkRef}
                  required
                />
              )}
            </div>
          </div>
          <button type="submit">Attach {isFile ? "File" : "Link"}</button>
        </form>
      </div>
    </div>
  );
}

export default SmallAttachmentModal;
