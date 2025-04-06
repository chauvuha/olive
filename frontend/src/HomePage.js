import React from "react";

const HomePage = () => {
  return (
    <div>
      <img src="logo.jpg" alt="Logo" style={{ maxWidth: '100%' }} />
      <h1>Hello Margaret!</h1>
      <div>
        <p>
          I’m O-live, here to help you feel safe without getting in the way. If
          something happens, I’ll gently alert your support network. You choose
          who gets alerted. I’m just here to help!
        </p>
        <button
          onClick={() => {
            window.location.href = "/viewcameras";
          }}
        >
          View my cameras
        </button>
        <button
          onClick={() => {
            window.location.href = "/supportnetwork";
          }}
        >
          View my network
        </button>
      </div>
    </div>
  );
};

export default HomePage;
