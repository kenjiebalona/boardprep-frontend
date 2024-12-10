import React, { useEffect, useRef, useState } from "react";
import "../styles/post.scss";
import { FaReply, FaEllipsisV, FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoChevronForwardOutline, IoChevronDownOutline } from "react-icons/io5";
import profileImage from "../assets/16.png";
import { convertToPHTime } from "../functions";
import Reply from "./Reply";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import axiosInstance from "../axiosInstance";

interface PostProps {
  post: Posts;
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
}

interface Posts {
  id: number;
  content: string;
  created_at: string;
  class_instance: number;
  teacher: string;
  teacher_name: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  post: number;
  user: string;
  user_name: string;
}

function Post({ post, setPosts }: PostProps) {
  const user = useAppSelector(selectUser);
  const [showMenu, setShowMenu] = useState(false);
  const replyRef = useRef<HTMLInputElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [content, setContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(
          `/comments/?post_id=${post.id}`
        );
        setComments(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [post.id]);

  const toggleMenu = () => setShowMenu(!showMenu);

  const deletePost = async () => {
    try {
      await axiosInstance.delete(`/posts/${post.id}/`);
      setPosts((posts: Posts[]) =>
        posts.filter((currPost) => currPost.id !== post.id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    deletePost();
  };

  const handleReply = async () => {
    try {
      const reply = replyRef.current?.value;
      if (reply) {
        const response = await axiosInstance.post(`/comments/`, {
          content: reply,
          post: post.id,
          user: user.token.id,
        });
        setComments([...comments, response.data]);
        replyRef.current!.value = "";
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyClick = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    handleReply();
  };

  const handleShowReplies = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowReplies(!showReplies);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      handleReply();
    }
  };

  const saveEdit = async () => {
    if (newContent === content) {
      setIsEditing(false);
      setError("");
      return;
    }
    try {
      await axiosInstance.post(`/posts/${post.id}/update_content/`, {
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
    <div className="post-card">
      <div className="post-card--read">
        <div className="post-card--read--header">
          <div className="post-card--read--header--left">
            <div className="post-card--read--header--left--pic">
              <img src={profileImage} className="logo" alt="RILL" />
            </div>
            <div className="post-card--read--header--left--name">
              {post.teacher_name}
            </div>
            <div className="post-card--read--header--left--time">
              {convertToPHTime(post.created_at)}
            </div>
          </div>
          {post.teacher === user.token.id && (
            <div className="post-card--read--header--menu" onClick={toggleMenu}>
              <FaEllipsisV />
              {showMenu && (
                <div className="menu-dropdown">
                  <ul>
                    <li onClick={(e) => setIsEditing(true)}>Edit</li>
                    <li onClick={handleDeletePost}>Delete</li>
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
          <div className="post-card--read--body">{content}</div>
        )}
        <div className="post-card--read--replies">
          {comments.length > 0 && (
            <div
              className="post-card--read--replies__view"
              onClick={handleShowReplies}
            >
              View replies{" "}
              {showReplies ? (
                <IoChevronDownOutline />
              ) : (
                <IoChevronForwardOutline />
              )}
            </div>
          )}
          {showReplies &&
            comments.map((comment) => (
              <Reply
                key={comment.id}
                comment={comment}
                setComments={setComments}
              />
            ))}
        </div>
      </div>
      <div className="post-card--reply">
        <FaReply onClick={handleReplyClick} />
        <input
          type="text"
          className="post-card--reply--input"
          placeholder="Reply"
          ref={replyRef}
          onKeyUp={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default Post;
