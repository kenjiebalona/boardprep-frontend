import { useState, useEffect } from "react";
import "../styles/forumlike.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import ForumLikeCard from "./ForumLikeCard";
import axiosInstance from "../axiosInstance";

interface ForumModalCommentProps {
  id: number;
  closeModal: () => void;
}

function ForumModalLike({ id, closeModal }: ForumModalCommentProps) {
  const user = useAppSelector(selectUser);
  const [count, setCount] = useState(0);
  const [likes, setLikes] = useState<any[]>([]);

  useEffect(() => {
    getLikes();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/create/like/", {
        post: id,
        user: user.token.id,
      });
      console.log(res.data);
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  const getLikes = async () => {
    try {
      const res = await axiosInstance.get(`/get/like/?post=${id}`);
      console.log("getting likes");

      setLikes(res.data);
      setCount(res.data.length);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="like-modal" className="like-modal">
      <div className="like-modal-content">
        <div className="like-modal-header">
          <h1 className="like-title">Likes - {count}</h1>
          <span className="close like-title" onClick={closeModal}>
            &times;
          </span>
        </div>
        <div className="like-cards">
          {likes.map((like) => (
            <ForumLikeCard
              key={like.id}
              author={like.user}
              dateCreate={like.created_at}
            />
          ))}
        </div>
        <button
          type="submit"
          className="like-card-button"
          onClick={handleSubmit}
        >
          Like
        </button>
      </div>
    </div>
  );
}

export default ForumModalLike;
