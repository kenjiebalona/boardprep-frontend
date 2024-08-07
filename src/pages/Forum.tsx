import React, { useState, useEffect } from 'react';
import ForumPost from '../components/ForumPost';
import '../styles/forum.scss'
import ForumCreateModal from '../components/ForumCreateModal';
import axiosInstance from '../axiosInstance';

interface Posts {
  author: string;
  dateCreate: string;
  title: string;
  content: string;
  tags: string;
}

const Forum = () => {
  const [post, setPosts] = useState<Posts[]>([]);
  const [createPost, setCreatePost] = useState(false);

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async () => {
    try {
      const res = await axiosInstance.get('/get/post/');
      console.log(res.data);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const handleNewButton = async () => {
    try {
      const res = await axiosInstance.get('/get/post/');
      console.log(res.data);
      const sortedPost = res.data.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setPosts(sortedPost);
    } catch (err) {
      console.log(err);
    }
  }

  const handleTopButton = async () => {
    try {
      const res = await axiosInstance.get('/get/post/');

      const posts = res.data;

      const fetchLikesPromises = posts.map(async (post: any) => {
        try {
          const likesRes = await axiosInstance.get(`/get/like/?post=${post.id}`);
          const likesCount = likesRes.data.length;
          return { ...post, likesCount };
        } catch (err) {
          console.log(err);
          return { ...post, likesCount: 0 };
        }
      });

      const postsWithLikes = await Promise.all(fetchLikesPromises);

      const sortedPosts = postsWithLikes.sort((a, b) => b.likesCount - a.likesCount);

      console.log(sortedPosts);
      setPosts(sortedPosts);
    } catch (err) {
      console.log(err);
    }
  }

  const handleHotButton = async () => {
    try {
      const res = await axiosInstance.get('/get/post/');
      const posts = res.data;

      const fetchCommentsPromises = posts.map(async (post: any) => {
        try {
          const commentsRes = await axiosInstance.get(`/get/comment/?post=${post.id}`);
          const commentsCount = commentsRes.data.length;
          return { ...post, commentsCount };
        } catch (err) {
          console.log(err);
          return { ...post, commentsCount: 0 };
        }
      });

      const postsWithComments = await Promise.all(fetchCommentsPromises);

      const sortedPosts = postsWithComments.sort((a, b) => b.commentsCount - a.commentsCount);

      console.log(sortedPosts);
      setPosts(sortedPosts);
    } catch (err) {
      console.log(err);
    }
  }

  const openCreatePost = () => {
    setCreatePost(true);
    console.log('Open Create Post');
  };

  const closeCreatePost = () => {
    setCreatePost(false);
    console.log('Close Create Post');
  };

  return (
    <div className="background">
      <header>
        <div className='form-pili'>
          <button className="form-pili-item" onClick={handleNewButton}>New</button>
          <button className="form-pili-item" onClick={handleTopButton}>Top</button>
          <button className="form-pili-item" onClick={handleHotButton}>Hot</button>
        </div>
        <div className='btn-post'>
          <button className="user-c" onClick={openCreatePost}>Create Post</button>
        </div>
        {createPost && (
            <ForumCreateModal setPosts={setPosts} closeModal={closeCreatePost} />
          )}
      </header>
      <div className='forum-posta-anay'>
        {post.map((post: any) => (
          <ForumPost key={post.id} id={post.id} author={post.author} dateCreate={post.created_at} title={post.title} content={post.content} tags={post.tags} />
        ))}
      </div>
    </div>
  );
};

export default Forum;
