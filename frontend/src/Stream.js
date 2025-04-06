import React, { useState, useEffect } from 'react';

function App() {
  const [imageSrc, setImageSrc] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/stream');
        const data = await response.json();

        if (data.status === 'error') {
          console.log(data.message);
        } else {
          // Set the image source to the base64 string returned by the Flask server
          setDescription(data.description);
          setImageSrc(`data:image/jpeg;base64,${data.image}`); // Embed the base64-encoded image in the <img> tag
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchData();
  }, []); // Runs once when the component mounts

  return (
    <div>
      <h1>Live Image Stream</h1>
      <p>{description}</p>
      <img src={imageSrc} alt="Live" />
    </div>
  );
}

export default App;



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Stream = () => {
//   const [imageSrc, setImageSrc] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchImage = () => {
//         fetch(`${process.env.REACT_APP_API_BASE_URL}/stream`)
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error("Network response was not ok");
//           }
//           return response.blob();
//         })

//         .then((blob) => {
//           const newImageUrl = URL.createObjectURL(blob);
//           setImageSrc(newImageUrl);
//           return () => URL.revokeObjectURL(newImageUrl);
//         })
//         .catch((error) => {
//           console.error("Error fetching the stream image:", error);
//         });
//     };
//     fetchImage();
//     const interval = setInterval(fetchImage, 5000); // Fetch every 5 seconds
//     return () => clearInterval(interval); // Cleanup on unmount
//   }, []);

//   return (
//     <div>
//         Video Stream:
//       {imageSrc ? (
//         <img src={imageSrc} alt="Streamed Image" />
//       ) : (
//         <p>No image available</p>
//       )}
//     </div>
//   );
// };

// export default Stream;
