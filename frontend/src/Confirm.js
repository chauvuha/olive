import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

localStorage.setItem("user", "Stevie");

const NotificationComponent = () => {
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Retrieve the token (stored in localStorage after login, for example)
    const user = localStorage.getItem('user');  // or cookies/session
    console.log(user);

    // Connect to the WebSocket server and send the token
    const socket = io('http://localhost:5000', {
      query: { user: user }  // Send user as part of the connection
    });

    socket.on("connect", () => {
      console.log(`${user} connected to server!`);
      // socket.emit("my_event", { data: "Hello from the client!" });
    });

    // Listen for notifications
    socket.on('notification', (data) => {
      setNotification(data.message);
      console.log(data.message);
    });

    // Cleanup the WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (

    <div>
      <p>test</p>

      <div>
        {notification && <div className="notification">{notification}</div>}
      </div>
    </div>
  );
};

export default NotificationComponent;


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

