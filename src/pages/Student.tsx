import { useState } from 'react';
import SignupModal from '../components/SignUpModal';
import SigninModal from '../components/SignInModal';
import student from '../assets/student.png';
import '../styles/user.scss';

const Student = () => {
  const [modalOpenSignin, setModalOpenSignin] = useState(false);
  const [modalOpenSignup, setModalOpenSignup] = useState(false);

  const openModalSignin = () => {
    setModalOpenSignin(true);
    console.log('Open Signin');
  };

  const closeModalSignin = () => {
    setModalOpenSignin(false);
    console.log('Close Signin');
  };

  const openModalSignup = () => {
    setModalOpenSignup(true);
    console.log('Open Signup');
  };

  const closeModalSignup = () => {
    setModalOpenSignup(false);
    console.log('Close Signup');
  };

  return (
    <div className="background">
      <header>
        <h1>
          <a href="/" className="homer">
            BoardPrep
          </a>{' '}
          - Student
        </h1>
        <div>
          <div className="user">
            <button className="user-c" onClick={openModalSignin}>
              Signin
            </button>
            <button className="user-c" onClick={openModalSignup}>
              Signup
            </button>
          </div>
          {modalOpenSignup && (
            <SignupModal closeModal={closeModalSignup} userType="student" />
          )}
          {modalOpenSignin && (
            <SigninModal closeModal={closeModalSignin} userType="student" />
          )}
        </div>
      </header>
      <div className="content">
        <div className="ct">
          <h3 className="ct-title">Empower Your Learning Journey</h3>
          <p className="ct-p">
            Joining BoardPrep as a student opens doors to a tailored learning
            experience.<br/> Dive into interactive lessons, quizzes, and resources
            designed to boost your exam<br/> readiness. Our app adapts to your pace,
            ensuring a personalized learning journey.
          </p>
        </div>
        <div className="ani-user">
          <img src={student} alt="boardprep" className="bp-img-user" />
          <div className="cardo-user dalisay-user"></div>
        </div>
      </div>
    </div>
  );
};

export default Student;
