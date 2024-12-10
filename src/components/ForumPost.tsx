import React, { useState } from 'react';
import '../styles/forum.scss';
import boardprep from '../assets/boardprep.png';
import ForumModalComment from './ForumModalComment';
import ForumModalLike from './ForumModalLike';

interface ForumPostProps {
  key: number;
  id: number;
  author: string;
  dateCreate: string;
  title: string;
  content: string;
  tags: string;
}

const ForumPost = ({
  id,
  author,
  dateCreate,
  title,
  content,
  tags,
}: ForumPostProps) => {
  const [modalOpenComment, setModalOpenComment] = useState(false);
  const [modalOpenLike, setModalOpenLike] = useState(false);

  const tagso = Array.from(tags.split(','));

  const date = new Date(dateCreate);

  function formatDate(date: Date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
  }

  const openModalComment = () => {
    setModalOpenComment(true);
    console.log('Open Comment');
  };

  const closeModalComment = () => {
    setModalOpenComment(false);
    console.log('Close Comment');
  };

  const openModalLike = () => {
    // Logic for opening Signup modal
    setModalOpenLike(true);
    console.log('Open Signup');
  };

  const closeModalLike = () => {
    // Logic for opening Signup modal
    setModalOpenLike(false);
    console.log('Close Signup');
  };

  return (
    <div className="forum-post">
      <div className="forum-post-image">
        <img className="forum-image" alt='forum img' src={boardprep}></img>
      </div>
      <div className="forum-post-details">
        <div className="forum-author-and-date">
          <span className="forum-post-author">Author: {author}</span>
          <span className="forum-post-date">{formatDate(date)}</span>
        </div>
        <span className="forum-post-title">{title}</span>
        <div className="forum-post-content">{content}</div>
        <div className="forum-post-tags-buttons">
          <div>
            {tagso.map((tag: any) => (
              <span className="forum-post-tags">{tag}</span>
            ))}
          </div>
          <div className="forum-buttons">
            <button className="forum-button" onClick={openModalComment}>
              Comment
            </button>
            <button className="forum-button" onClick={openModalLike}>
              Like
            </button>
            {modalOpenComment && (
              <ForumModalComment key={id} id={id} closeModal={closeModalComment} />
            )}
            {modalOpenLike && <ForumModalLike key={id} id={id} closeModal={closeModalLike} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPost;
