import { useState } from "react";
import "../styles/class.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import axiosInstance from "../axiosInstance";

interface Posts {
  author: string;
  dateCreate: string;
  title: string;
  content: string;
  tags: string;
}

interface ForumCreateProps {
  closeModal: () => void;
  setPosts: (classes: Posts[]) => void;
}

function ForumCreate({ closeModal, setPosts }: ForumCreateProps) {
  const user = useAppSelector(selectUser);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/create/post/", {
        post: user.token.id,
        author: user.token.id,
        title,
        content,
        tags,
      });
      const posts = await axiosInstance.get("/get/post/");
      setPosts(posts.data);
      console.log(res.data);
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="title">Create Post</h1>
          <span className="close title" onClick={closeModal}>
            &times;
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            name="title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Content"
            name="content"
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags"
            name="tags"
            onChange={(e) => setTags(e.target.value)}
          />
          <button type="submit" className="card-button">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForumCreate;
