import "../styles/home.scss";
import home from "../assets/home.png";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const studentHandler = () => {
    navigate("/student");
  };

  const teacherHandler = () => {
    navigate("/teacher");
  };

  const contentHandler = () => {
    navigate("/content-creator");
  };

  return (
    <div className="background">
      <header>
        <h1>
          <a href="/" className="homer">
            BoardPrep
          </a>
        </h1>
        <div className="user">
          <button className="user-c" onClick={studentHandler}>
            Student
          </button>
          <button className="user-c" onClick={teacherHandler}>
            Teacher
          </button>
          <button className="user-c" onClick={contentHandler}>
            Creator
          </button>
        </div>
      </header>
      <div className="content">
        <div className="ct">
          <h3 className="ct-title">
            Embrace Success with BoardPrep: <br />Tailored for Triumph
          </h3>
          <p className="ct-p">
            BoardPrep is your gateway to a tailored learning experience designed
            to
            <br /> maximize your success. Explore interactive lessons,
            collaborate seamlessly,
            <br /> and track your progress effortlessly. Join us in the journey
            towards academic triumph!
          </p>
        </div>
        <div className="ani">
          <img src={home} alt="boardprep" className="bp-img" />
          <div className="cardo dalisay"></div>
        </div>
      </div>
    </div>
  );
}

export default Home;
