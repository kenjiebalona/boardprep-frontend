import React, { useState } from "react";
import profileImage from "../assets/16.png";
import "../styles/reply.scss";
import { convertToPHTime } from "../functions";
import { FaEllipsisV, FaSave } from "react-icons/fa";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import { MdCancel } from "react-icons/md";
import axiosInstance from "../axiosInstance";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  post: number;
  user: string;
  user_name: string;
}

interface ReplyProps {
  comment: Comment;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
}

function Reply({ comment, setComments }: ReplyProps) {
  const user = useAppSelector(selectUser);
  const [showMenu, setShowMenu] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(comment.content);
  const [content, setContent] = useState(comment.content);
  const [error, setError] = useState("");

  const toggleMenu = () => setShowMenu(!showMenu);

  const deleteComment = async () => {
    try {
      await axiosInstance.delete(`/comments/${comment.id}/`);
      setComments((prevComments: Comment[]) =>
        prevComments.filter((currComment) => currComment.id !== comment.id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    deleteComment();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setHovered(false);
  };

  const saveEdit = async () => {
    if (newContent === content) {
      setIsEditing(false);
      setError("");
      return;
    }
    try {
      await axiosInstance.post(`/comments/${comment.id}/update_content/`, {
        content: newContent,
      });
      setContent(newContent);
      setIsEditing(false);
      setError("");
    } catch (err: any) {
      setError(err.response.data.message);
    }
  };

  const handleSaveEdit = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    saveEdit();
  };

  return (
    <div
      className="reply"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="reply--header">
        <div className="reply--header__left">
          <div className="reply--header__left--pic">
            <img src={profileImage} className="logo" alt="RILL" />
          </div>
          <div className="reply--header__left--name">{comment.user_name}</div>
          <div className="reply--header__left--time">
            {convertToPHTime(comment.created_at)}
          </div>
        </div>
        {comment.user === user.token.id && hovered && (
          <div className="reply--header__menu" onClick={toggleMenu}>
            <FaEllipsisV />
            {showMenu && (
              <div className="menu-dropdown">
                <ul>
                  <li onClick={(e) => setIsEditing(true)}>Edit</li>
                  <li onClick={handleDeleteComment}>Delete</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="text-container">
          {error && <div className="error">Error: {error}</div>}
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
          />
          <div className="actions">
            <div className="save" onClick={handleSaveEdit}>
              <FaSave /> Save
            </div>
            <div
              className="cancel"
              onClick={(e) => {
                setNewContent(content);
                setIsEditing(false);
                setError("");
              }}
            >
              <MdCancel /> Cancel
            </div>
          </div>
        </div>
      ) : (
        <div className="reply--body">{content}</div>
      )}
    </div>
  );
}

export default Reply;
