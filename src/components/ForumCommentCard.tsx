import React from 'react';
import '../styles/forumcomment.scss';
import boardprep from '../assets/boardprep.png';

interface CommentProps {
  author: string;
  dateCreate: string;
  content: string;
}

const ForumCommentCard = ({ author, dateCreate, content }: CommentProps) => {

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

  return (
    <div className="comment-forum-post">
      <div className="comment-forum-post-image">
        <img className="comment-forum-image" alt='forum img' src={boardprep}></img>
      </div>
      <div className="comment-forum-post-details">
        <div className="comment-forum-author-and-date">
          <span className="comment-forum-post-author">Author: {author}</span>
          <span className="comment-forum-post-date">{formatDate(date)}</span>
        </div>
        <div className="comment-forum-post-content">{content}</div>
      </div>
    </div>
  );
};

export default ForumCommentCard;
