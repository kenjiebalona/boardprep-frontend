import React from "react";
import "../styles/errorcard.scss";

interface ErrorCardProps {
  message: string;
}

function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="error-card">
      <div className="error-card__header">
        Error: <span className="error-card__header--msg">{message}</span>
      </div>
    </div>
  );
}

export default ErrorCard;
