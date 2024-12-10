import React, { useState } from "react";
import "../styles/classcodemodal.scss";
import { MdContentCopy } from "react-icons/md";

interface ClassCodeModalProps {
  closeModal: () => void;
  classCode: string;
}

function ClassCodeModal({ closeModal, classCode }: ClassCodeModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(classCode);
  };

  const handleCopy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    copy();
    setIsCopied(true);
  };
  return (
    <div id="modal" className="modal">
      <div className="class-code-modal">
        <div className="modal-header">
          <h1 className="h1">Class Code</h1>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
        </div>
        <div className="class-code-body">
          <p className="request-hint">
            Share this code to your students. They will use this code during
            their registration to join your class. You will then accept their
            join requests in the students tab.
          </p>
          <div className="class-code">{classCode}</div>
          <button className="copy" onClick={handleCopy}>
            <MdContentCopy />
            {isCopied ? "Copied" : "Copy Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassCodeModal;
