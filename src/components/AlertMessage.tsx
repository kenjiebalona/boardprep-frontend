import React, { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type: string;
  onClose: (isSuccess: boolean) => void;
}

const AlertMessage: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
      onClose(true);
    }, 4500);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleDismiss = () => {
    setShowAlert(false);
    onClose(true);
  };

  return showAlert ? (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999, 
        borderRadius: "10px",
        backgroundColor: type === "success" ? "#4caf50" : "#f44336",
        color: "white",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        transition: "opacity 0.5s",
        opacity: showAlert ? 1 : 0,
      }}
    >
      <span style={{ fontWeight: "500", fontSize: "1rem" }}>{message}</span>
      <button
        style={{
          background: "none",
          border: "none",
          color: "white",
          marginLeft: "20px",
          fontSize: "1.2rem",
          cursor: "pointer",
          transition: "color 0.3s",
        }}
        onClick={handleDismiss}
      >
        ✕
      </button>
    </div>
  ) : null;
};

export default AlertMessage;
