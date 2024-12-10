import React, { useEffect, useState } from "react";
import Post from "./Post";
import "../styles/poststab.scss";
import { MdOutlinePostAdd, MdSend } from "react-icons/md";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import Loader from "./Loader";
import axiosInstance from "../axiosInstance";

interface Posts {
  id: number;
  content: string;
  created_at: string;
  class_instance: number;
  teacher: string;
  teacher_name: string;
}

interface PostProps {
  classId: number;
}

function PostsTab({ classId }: PostProps) {
  const user = useAppSelector(selectUser);
  const [addingPost, setAddingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<Posts[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/posts/?class_id=${classId}`);
        setPosts(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, [classId]);

  const handleAddPostClick = () => {
    setAddingPost(true);
  };

  const handleSendPost = async () => {
    try {
      if (newPostContent !== "") {
        const response = await axiosInstance.post(`/posts/`, {
          content: newPostContent,
          class_instance: classId,
          teacher: user.token.id,
        });
        setPosts([...posts, response.data]);
      }
    } catch (err) {
      console.error(err);
    }
    setAddingPost(false);
    setNewPostContent("");
  };

  return (
    <div className="post-container">
      <div className="posts-tab">
        <div className="posts-tab--center">
          {isLoading ? (
            <>
              <Loader />
              <div>Loading Posts...</div>
            </>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Post key={post.id} post={post} setPosts={setPosts} />
            ))
          ) : (
            <div>No posts yet.</div>
          )}
        </div>
      </div>
      <div className="bottomd">
        {user.token.type === "T" &&
          (addingPost ? (
            <div className="input-container">
              <textarea
                className="post-input"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Type your post..."
              />
              <button className="send-post" onClick={handleSendPost}>
                <MdSend /> Post
              </button>
            </div>
          ) : (
            <button
              className={addingPost ? "add-post" : "add-post animate-button"}
              onClick={handleAddPostClick}
            >
              <MdOutlinePostAdd /> Add Post
            </button>
          ))}
      </div>
    </div>
  );
}

export default PostsTab;
