import React, { useEffect, useState } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import "../styles/studentcard.scss";
import profileImage from "../assets/16.png";
import { FaEllipsisH } from "react-icons/fa";
import axiosInstance from "../axiosInstance";
import StudentPerformanceModal from "./StudentPerformanceModal";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";

interface Student {
  user_name: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  registration_date: string;
  last_login: string;
  specialization: number;
  specialization_name: string;
  institution_id: number;
  subscription: number;
}

interface StudentCardProps {
  classId: number;
  studentId: string;
  is_accepted: boolean;
  requestId?: number;
  fetchClass?: () => void;
}

function StudentCard({
  classId,
  studentId,
  is_accepted,
  requestId,
  fetchClass,
}: StudentCardProps) {
  const user = useAppSelector(selectUser);
  const [student, setStudent] = useState<Student>();
  const [acceptColor, setAcceptColor] = useState("#08d46c");
  const [rejectColor, setRejectColor] = useState("#e04434");
  const [isAccepted, setIsAccepted] = useState(is_accepted);
  const [showMenu, setShowMenu] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axiosInstance.get(`/student/${studentId}/`);
        setStudent(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudent();
  }, [studentId]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleAccept = async () => {
    try {
      await axiosInstance.post(`/classes/${classId}/accept-join-request/`, {
        join_request_id: requestId,
      });
      setIsAccepted(true);
      if (fetchClass) {
        fetchClass();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptEnter = () => {
    setAcceptColor("#ffffff");
  };

  const handleAcceptLeave = () => {
    setAcceptColor("#08d46c");
  };

  const handleRejectEnter = () => {
    setRejectColor("#ffffff");
  };

  const handleRejectLeave = () => {
    setRejectColor("#e04434");
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleRemoveStudent = async () => {
    try {
      await axiosInstance.post(`/classes/${classId}/remove-student/`, {
        student: student?.user_name,
      });
      if (fetchClass) {
        fetchClass();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <tr className="student-card">
      <td>
        <div className="student-card__name">
          <div className="student-card__name--pic">
            <img src={profileImage} className="logo" alt="RILL" />
          </div>
          {`${student?.first_name} ${student?.last_name}`}
        </div>
      </td>
      <td>{student?.specialization_name}</td>
      <td>{student?.institution_id}</td>
      <td>
        {!isAccepted && (
          <div className="student-card__req-buttons">
            <button
              className="accept request_btn"
              onClick={handleAccept}
              onMouseEnter={handleAcceptEnter}
              onMouseLeave={handleAcceptLeave}
            >
              <IoMdCheckmark color={acceptColor} />
            </button>
            <button
              className="reject request_btn"
              onMouseEnter={handleRejectEnter}
              onMouseLeave={handleRejectLeave}
            >
              <IoMdClose color={rejectColor} />
            </button>
          </div>
        )}
      </td>
      {user.token.type === "T" && isAccepted ? (
        <td className="ellipsis">
          <FaEllipsisH style={{ cursor: "pointer" }} onClick={toggleMenu} />
          {showMenu && (
            <div className="menu-dropdown">
              <ul>
                <li onClick={openModal}>View Performance</li>
                <li onClick={handleRemoveStudent}>Remove</li>
              </ul>
            </div>
          )}
        </td>
      ) : (
        <td></td>
      )}
      {modalOpen && (
        <StudentPerformanceModal
          classId={classId}
          student={student!}
          closeModal={closeModal}
        />
      )}
    </tr>
  );
}

export default StudentCard;
