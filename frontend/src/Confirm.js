import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

localStorage.setItem("user", "Chau");

const NotificationPage = () => {
  const [notification, setNotification] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [question, setQuestion] = useState(""); // Store the question for the modal
  const [response, setResponse] = useState(null); // Store the user's response
  const [timeoutId, setTimeoutId] = useState(null); // To store the timeout ID so we can clear it if needed

  // Handle the user's response (Yes or No)
  const handleResponse = useCallback(
    (answer, emergency) => {
      setResponse(answer);
      console.log(`User response: ${answer}`);

      // Send the response back to the backend
      const user = localStorage.getItem("user");
      const socket = io("http://localhost:5000"); // Connect to the socket again or use the existing socket
      socket.emit("confirm_response", {
        user: user,
        response: answer,
        emergency: emergency,
      });

      // Close the modal after response
      setIsModalOpen(false);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
    [timeoutId]
  );

  useEffect(() => {
    // Retrieve the 'user' from localStorage
    const user = localStorage.getItem("user");
    console.log(user);

    // Connect to the WebSocket server and send the user info
    const socket = io("http://localhost:5000", {
      query: { user: user }, // Send user as part of the connection
    });

    socket.on("connect", () => {
      console.log(`${user} connected to server!`);
    });

    // Listen for notifications from the backend
    socket.on("notification", (data) => {
      setNotification(data.message);
      console.log(data.message);

      // Set the modal question and open it
      setQuestion(data.message); // Set the question text to the notification message
      setIsModalOpen(true); // Open the modal

      // Set a timeout to automatically respond with "No" if the user doesn't respond in 10 seconds
      const timer = setTimeout(() => {
        handleResponse("No", data.message);
      }, 30000); // milliseconds

      // Store the timeout ID so we can clear it if the user responds early
      setTimeoutId(timer);
    });

    // Cleanup the WebSocket connection on component unmount
    return () => {
      socket.disconnect();
      if (timeoutId) {
        clearTimeout(timeoutId); // Clean up the timeout if the component unmounts
      }
    };
  }, [timeoutId, handleResponse]);

  return (
    <div className="main-box">
      {/* <h1>Notification Page</h1> */}

      {/* Render the modal if the modal is open */}
      {/* {isModalOpen && ( */}
      <div className="modal">
        <div className="modal-content">
        <h2 className="emergency-message">
  I've detected an emergency and will notify your support network in 30
  seconds.
</h2>
          <br></br>
          <h2>Are you okay?</h2>
          <br></br>

          <div className="question-flex">
            <div className="question-box">
              <button
                className="button-green"
                onClick={() => handleResponse("Yes", question)}
              >
                Yes
              </button>
              <button
                className="button-red"
                onClick={() => handleResponse("No", question)}
              >
                No
              </button>
            </div>
          </div>
          <br></br>
          <h2>Description{question}</h2>
        </div>
      </div>
      <div className="logo-container">
        <img src="olive2.png" alt="Logo" className="logo2" />
      </div>
      {/* )} */}

      {/* Optionally show the notification as a text below */}
      {/* <div className="notification">
        {notification && <p>{notification}</p>}
      </div> */}
    </div>
  );
};

export default NotificationPage;

// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// localStorage.setItem("user", "Stevie");

// const NotificationComponent = () => {
//   const [notification, setNotification] = useState('');

//   useEffect(() => {
//     // Retrieve the token (stored in localStorage after login, for example)
//     const user = localStorage.getItem('user');  // or cookies/session
//     console.log(user);

//     // Connect to the WebSocket server and send the token
//     const socket = io('http://localhost:5000', {
//       query: { user: user }  // Send user as part of the connection
//     });

//     socket.on("connect", () => {
//       console.log(`${user} connected to server!`);
//       // socket.emit("my_event", { data: "Hello from the client!" });
//     });

//     // Listen for notifications
//     socket.on('notification', (data) => {
//       setNotification(data.message);
//       console.log(data.message);
//     });

//     // Cleanup the WebSocket connection on component unmount
//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (

//     <div>
//       <p>test</p>

//       <div>
//         {notification && <div className="notification">{notification}</div>}
//       </div>
//     </div>
//   );
// };

// export default NotificationComponent;

// import React, { useEffect, useRef } from 'react';

// const Confirm = () => {

//     const hasResponded = useRef(false);

//     useEffect(() => {
//         const sendEmergencyText = setTimeout(() => {
//           if (!hasResponded.current) {
//             fetch('/api/send-text', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({
//                 message: 'Emergency: user did NOT respond to fall detection. Check in on them.',
//               }),
//             });
//           }
//         }, 10000); // 10 seconds

//         return () => clearTimeout(sendEmergencyText);
//       }, []);

//     const handleNo = () => {
//         fetch('/api/send-text', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ message: 'Emergency: user is NOT okay after fall detection. Check in on them' }),
//         });
//     };

//   const handleYes = () => {
//     window.location.href = '/homepage';
//   };

//   return (
//     <div>
//       <p>
//         We detected that you are falling. Emergency detected... We might contact your priority network. Are you okay?
//       </p>
//       <button onClick={handleYes}>Yes</button>
//       <button onClick={handleNo}>No</button>
//     </div>
//   );
// };

// export default Confirm;
