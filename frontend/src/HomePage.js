import React from "react";

const HomePage = () => {
  return (
    <div className="main-box">
      <img src="olive.png" alt="Logo" className="logo" />
      <h1>Hello Margaret!</h1>
      <div>
        <p>
          I’m O-live, here to help you feel safe without getting in the way. If
          something happens, I’ll gently alert your support network. You choose
          who gets alerted. I’m just here to help!
        </p>
        <div className='button-container'>
          <div>
            <button
              onClick={() => {
                window.location.href = "/viewcameras";
              }}
            >
              View my cameras
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                window.location.href = "/showallusers";
              }}
            >
              View my network
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
