import React, { FormEvent, useState, useEffect } from "react";
import "../styles/class.scss";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUser, signIn } from "../redux/slices/authSlice";

interface SigninModalProps {
  closeModal: () => void;
  userType: "student" | "teacher" | "content-creator";
}

function SigninModal({ closeModal, userType }: SigninModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user.isAuth) {
      const targetRoute = "/dashboard";
      console.log(targetRoute);
      navigate(targetRoute);
      closeModal();
    }
  }, [user, navigate, closeModal, userType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(signIn({ username, password }));
      const targetRoute = "/dashboard";
      navigate(targetRoute);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="title">
            {userType === "student"
              ? "Signin Student"
              : userType === "teacher"
              ? "Signin Teacher"
              : "Signin Creator"}
          </h1>
          <span className="close title" onClick={closeModal}>
            &times;
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User Name"
            name="username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="card-button">
            Signin
          </button>
        </form>
      </div>
    </div>
  );
}

export default SigninModal;
