import { useState, useEffect } from "react";
import "../styles/forumcomment.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import ForumCommentCard from "./ForumCommentCard";
import axiosInstance from "../axiosInstance";

interface ForumModalCommentProps {
  id: number;
  closeModal: () => void;
}

function ForumModalComment({ id, closeModal }: ForumModalCommentProps) {
  const user = useAppSelector(selectUser);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    getComment();
    console.log("key", id);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/create/comment/", {
        post: id,
        author: user.token.id,
        content: comment,
      });
      console.log(res.data);
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  const getComment = async () => {
    try {
      const res = await axiosInstance.get(`/get/comment/?post=${id}`);
      console.log("getting comments");
      console.log(res.data);
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="comment-modal" className="comment-modal">
      <div className="comment-modal-content">
        <div className="comment-modal-header">
          <h1 className="comment-title">Comments</h1>
          <span className="close comment-title" onClick={closeModal}>
            &times;
          </span>
        </div>
        <div className="comment-cards">
          {comments.map((comment: any) => (
            <ForumCommentCard
              key={comment.id}
              author={comment.author}
              dateCreate={comment.created_at}
              content={comment.content}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Add a comment..."
            name="comment"
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="card-button">
            Comment
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForumModalComment;
