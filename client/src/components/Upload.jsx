import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import DataModal from "./Modal";
import "../style/Upload.css";

const Upload = ({ onUploadSuccess }) => {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const formData = new FormData();
      formData.append("avatar", acceptedFiles[0]);

      setUploading(true);
      setMessage("Uploading...");

      axios.post("https://project-1-i21e.onrender.com/upload", formData)
        .then((response) => {
          if (response.data.error) {
            setMessage(response.data.error);
          } else {
            setMessage("Upload successful");
            console.log(response.data)
            setUploadedData(response.data);
            setIsModalOpen(true);
            onUploadSuccess(response.data);
          }
        })
        .catch((error) => {
          setMessage("Upload failed");
          console.error(error);
        })
        .finally(() => {
          setUploading(false);
        });
    },
  });

  useEffect(() => {
    if (uploading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setUploading(false);
      setMessage("Upload timed out. Please try again.");
    }
  }, [uploading, countdown]);

  return (
    <div {...getRootProps()} className="upload-container">
      <input {...getInputProps()} />
      <p>Drag 'n' drop an image here, or click to select one</p>
      <p>{message}</p>
      {uploading && <p>Time remaining: {countdown} seconds</p>}
      <DataModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        imageData={uploadedData}
      />
    </div>
  );
};

export default Upload;
