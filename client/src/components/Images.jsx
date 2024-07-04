import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/Images.css";

const Images = ({ newImageData }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get("https://project-1-i21e.onrender.com/data")
      .then((response) => {
        console.log(response.data);
        setImages(response.data);
      })
      .catch((error) => {
        console.error("Error retrieving images:", error);
      });
  }, []);

  useEffect(() => {
    if (newImageData) {
      setImages((prevImages) => [...prevImages, newImageData]);
    }
  }, [newImageData]);

  return (
    <div className="images-container">
      <h2>Images Data:</h2>
      <div>
        {images.map((image, index) => (
          <div key={index} className="image-card">
            <ul>
              <li>ID Number: {image.idNumber}</li>
              <li>First Name: {image.firstname}</li>
              <li>Last Name: {image.lastName}</li>
              <li>Date of Birth: {image.dateOfBirth}</li>
              <li>Date of Issue: {image.dateOfIssue}</li>
              <li>Date of Expiry: {image.dateOfExpiry}</li>
              <li>Date of Upload: {image.dateOfUpload}</li>
              <li>Status: {image.status}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Images;
