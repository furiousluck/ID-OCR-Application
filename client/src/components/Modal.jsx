import React from "react";
import Modal from "react-modal";
import "../style/Modal.css";

Modal.setAppElement("#root");

const DataModal = ({ isOpen, onRequestClose, imageData }) => {
  if (!imageData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Extracted Data"
      className="Modal"
      overlayClassName="Overlay"
    >
      <h2>Extracted Data</h2>
      <div className="modal-content">
        <ul>
          <li>ID Number: {imageData.identification_number}</li>
          <li>First Name: {imageData.name}</li>
          <li>Last Name: {imageData.last_name}</li>
          <li>Date of Birth: {imageData.date_of_birth}</li>
          <li>Date of Issue: {imageData.date_of_issue}</li>
          <li>Date of Expiry: {imageData.date_of_expiry}</li>
        </ul>
        <button onClick={onRequestClose}>Close</button>
      </div>
    </Modal>
  );
};

export default DataModal;
