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
      {/* Render the modal if the modal is open */}
      {/* {isModalOpen && ( */}
        <div className="modal">
          <div className="modal-content">
            <h2 className="emergency-message">
              I've detected an emergency and will notify your support network in
              30 seconds.
            </h2>
            <br />
            <h2>Are you okay?</h2>
            <br />

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
            <br />
            <h2>{question}</h2>
          </div>
          <div className="logo-container">
            <img src="olive3.png" alt="Logo" className="logo3" />
          </div>
        </div>
    </div>
  );
};

export default NotificationPage;
