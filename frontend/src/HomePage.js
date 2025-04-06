import React from 'react';

const HomePage = () => {
  return (
    <div>
      {/* <img src="logo.jpg" alt="Logo" style={{ maxWidth: '100%' }} /> */}
      <h1>O-live</h1>
      <div>
        <button onClick={() => { window.location.href = '/viewcameras'; }}>
          Go to View Cameras
        </button>
        <button onClick={() => { window.location.href = '/supportnetwork'; }}>
          Go to Support Network
        </button>
      </div>
    </div>
  );
};

export default HomePage;
