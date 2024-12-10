import React from "react";
import "../styles/forumlike.scss";
import boardprep from "../assets/boardprep.png";

interface CommentProps {
  author: string;
  dateCreate: string;
}

const ForumLikeCard = ({author, dateCreate}: CommentProps) => {

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
    <div className="like-forum-post">
      <div className="like-forum-post-image">
        <img className="like-forum-image" alt="forum img" src={boardprep}></img>
      </div>
      <div className="like-forum-post-details">
        <div className="like-forum-author-and-date">
          <span className="like-forum-post-author">{author}</span>
          <span className="like-forum-post-like">Like this post</span>
          <span className="like-forum-post-date">{formatDate(date)}</span>
        </div>
      </div>
    </div>
  );
}

export default ForumLikeCard;