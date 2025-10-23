import React from "react";
import "./GalleryPage.css";

const GalleryPage = () => {
  // List of images (from /public/images/)
  const images = [
    "/images/holy1.jpg",
    "/images/holy2.jpg",
    "/images/holy3.jpg",
    "/images/holy4.jpg",
    "/images/holy5.jpg",
    "/images/holy6.jpg",
    "/images/holy7.jpg"
  ];

  return (
    <div className="gallery-container brand-gradient">
      <h1>Gallery</h1>
      <div className="gallery-grid">
        {images.map((src, index) => (
          <div className="gallery-item" key={index}>
            <img src={src} alt={`Gallery ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
