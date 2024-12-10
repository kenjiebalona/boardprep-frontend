import React, { useState } from "react";
import StudentCard from "./StudentCard";
import "../styles/studentstab.scss";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import { IoPersonAddOutline } from "react-icons/io5";
import ClassCodeModal from "./ClassCodeModal";

interface JoinRequest {
  id: number;
  is_accepted: boolean;
  class_instance: number;
  student: string;
}

interface Class {
  classId: number;
  className: string;
  classDescription: string;
  course: string;
  students: string[];
  classCode: string;
  teacher: string;
}

interface StudentsTabProps {
  classId: number;
  joinRequests: JoinRequest[];
  students: string[];
  fetchClass: () => void;
  teacher: string;
  classItem: Class;
}

function StudentsTab({
  classId,
  joinRequests,
  students,
  fetchClass,
  teacher,
  classItem,
}: StudentsTabProps) {
  const [modal, setModal] = useState(false);
  const user = useAppSelector(selectUser);

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  return (
    <div className="student-container">
      <div className="students-tab">
        <div className="students-tab--center">
          {students.length + joinRequests.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Institution</th>
                  <th>Join Request</th>
                </tr>
              </thead>
              <tbody>
                {teacher === user.token.id &&
                  joinRequests.map((joinRequest, index) => {
                    return (
                      <StudentCard
                        key={index}
                        classId={classId}
                        studentId={joinRequest.student}
                        is_accepted={joinRequest.is_accepted}
                        requestId={joinRequest.id}
                        fetchClass={fetchClass}
                      />
                    );
                  })}
                {students.map((student, index) => (
                  <StudentCard
                    key={index}
                    classId={classId}
                    studentId={student}
                    is_accepted={true}
                    fetchClass={fetchClass}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students yet.</p>
          )}
          {modal && (
            <ClassCodeModal
              closeModal={closeModal}
              classCode={classItem.classCode}
            />
          )}
        </div>
      </div>
      {user.token.type === "T" && (
        <div className="bottomd">
          <button className="invite-student" onClick={openModal}>
            <IoPersonAddOutline /> Invite Students
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentsTab;
