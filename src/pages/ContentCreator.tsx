import { useState } from "react";
// import SignupModal from "../components/SignUpModal";
import SigninModal from "../components/SignInModal";
import teacher from '../assets/teacher.png';
import "../styles/user.scss";

const ContentCreator = () => {
  const [modalOpenSignin, setModalOpenSignin] = useState(false);
  // const [modalOpenSignup, setModalOpenSignup] = useState(false);

  const openModalSignin = () => {
    setModalOpenSignin(true);
    console.log("Open Signin");
  };

  const closeModalSignin = () => {
    setModalOpenSignin(false);
    console.log("Close Signin");
  };

  // const openModalSignup = () => {
  //   // Logic for opening Signup modal
  //   setModalOpenSignup(true);
  //   console.log("Open Signup");
  // };

  // const closeModalSignup = () => {
  //   // Logic for opening Signup modal
  //   setModalOpenSignup(false);
  //   console.log("Close Signup");
  // };

  return (
    <div className="background">
      <header>
        <h1>
          <a href="/" className="homer">
            BoardPrep
          </a>{" "}
          - ContentCreator
        </h1>
        <div>
          <div className="user">
            <button className="user-c" onClick={openModalSignin}>
              Signin
            </button>
          </div>
          {modalOpenSignin && (
            <SigninModal
              closeModal={closeModalSignin}
              userType="content-creator"
            />
          )}
        </div>
      </header>
      <div className="content">
        <div className="ct">
          <h3 className="ct-title">Empower Your Teaching <br/> Experience</h3>
          <p className="ct-p">
            As an educator joining BoardPrep, elevate your teaching with
            insightful<br/> analytics and tools. Track student progress, customize
            lessons, and collaborate <br/>seamlessly. Our app facilitates tailored
            guidance for each student's success and future.
          </p>
        </div>
        <div className="ani-user">
          <img src={teacher} alt="boardprep" className="bp-img-user" />
          <div className="cardo-user dalisay-user"></div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
