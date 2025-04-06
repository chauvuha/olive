import React, { useEffect, useRef } from 'react';

const Confirm = () => {

    const hasResponded = useRef(false);

    useEffect(() => {
        const sendEmergencyText = setTimeout(() => {
          if (!hasResponded.current) {
            fetch('/api/send-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: 'Emergency: user did NOT respond to fall detection. Check in on them.',
              }),
            });
          }
        }, 10000); // 10 seconds
    
        return () => clearTimeout(sendEmergencyText);
      }, []);

    const handleNo = () => {
        fetch('/api/send-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Emergency: user is NOT okay after fall detection. Check in on them' }),
        });
    };

  const handleYes = () => {
    window.location.href = '/homepage';
  };

  return (
    <div>
      <p>
        We detected that you are falling. Emergency detected... We might contact your priority network. Are you okay?
      </p>
      <button onClick={handleYes}>Yes</button>
      <button onClick={handleNo}>No</button>
    </div>
  );
};

export default Confirm;
