import { useState, useEffect } from "react";
import "../styles/class.scss";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUser, signUp } from "../redux/slices/authSlice";

interface SignupModalProps {
  closeModal: () => void;
  userType: "student" | "teacher" | "content-creator";
}

function SignupModal({ closeModal, userType }: SignupModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user.isAuth) {
      navigate("/classes");
      closeModal();
    }
  }, [user, closeModal, navigate]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await dispatch(
        signUp({
          username,
          password,
          firstname,
          lastname,
          email,
          specialization,
          userType,
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="title">
            {userType === "student" ? "Signup Student" : userType === "teacher" ? "Signup Teacher" : "Signup Content Creator"}
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
            type="text"
            placeholder="First Name"
            name="firstname"
            onChange={(e) => setFirstname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lastname"
            onChange={(e) => setLastname(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            name="specialization"
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">Select Specialization</option>
            <option value="1">Chemical Engineering</option>
            <option value="2">Civil Engineering</option>
            <option value="3">Electrical Engineering</option>
            <option value="4">Mechanical Engineering</option>
          </select>
          <button type="submit" className="card-button">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupModal;
