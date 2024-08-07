import React, { useEffect, useState } from "react";
import ClassModal from "../components/ClassModal";
import profileImage from "../assets/16.png";
import ClassCard from "../components/ClassCard";
import DropDownProfile from "../components/DropDownProfile";
import "../styles/class.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import axiosInstance from "../axiosInstance";
import AlertMessage from "../components/AlertMessage";

interface Class {
  classId: number;
  className: string;
  classDescription: string;
  teacher_name: string;
  course: string;
  image: string;
  students: string[];
  classCode: string;
}

function Classes() {
  const user = useAppSelector(selectUser);
  const [classes, setClasses] = useState<Class[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(
        `/classes/?${user.token.type === "T" ? "teacher_id" : "student_id"}=${
          user.token.id
        }`
      );
      setClasses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = (isJoin: boolean) => {
    setModalOpen(false);
    if (isJoin) {
      setAlert(true);
    }
  };

  return (
    <div className="class-background">
      <header>
        <h1>MY CLASSES</h1>
        {/* <div className="profile-pic2">
          <img
            src={profileImage}
            className="logo"
            alt="RILL"
            onClick={() => setOpenProfile((prev) => !prev)}
          />
          {openProfile && <DropDownProfile />}
        </div> */}
      </header>
      <div className="class-container">
        {classes.map((classItem, index) => (
          <ClassCard key={index} class={classItem} />
        ))}
        <div className="button-container">
          <button className="create-classbtn" onClick={openModal}>
            {user.token.type === "T" ? "Create Class +" : "Join Class +"}
          </button>
        </div>
        {modalOpen && (
          <ClassModal
            closeModal={closeModal}
            classes={classes}
            setClasses={setClasses}
          />
        )}
      </div>
      {alert && (
        <AlertMessage
          message="Sent Join Request!"
          type="success"
          onClose={(isSuccess: boolean) => isSuccess && setAlert(false)}
        />
      )}
    </div>
  );
}

export default Classes;
