import { useState } from 'react';

const LogIn = () => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username);
      alert(`Test, hello ${username}!`);
    }
  };

  return (
    <div>
      <img src="logo.jpg" alt="Logo" style={{ maxWidth: '100%' }} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LogIn;
