import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Stream = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImage = () => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/stream`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.blob();
        })

        .then((blob) => {
          const newImageUrl = URL.createObjectURL(blob);
          setImageSrc(newImageUrl);
          return () => URL.revokeObjectURL(newImageUrl);
        })
        .catch((error) => {
          console.error("Error fetching the stream image:", error);
        });
    };
    fetchImage();
    const interval = setInterval(fetchImage, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div>
        Video Stream:
      {imageSrc ? (
        <img src={imageSrc} alt="Streamed Image" />
      ) : (
        <p>No image available</p>
      )}
    </div>
  );
};

export default Stream;
