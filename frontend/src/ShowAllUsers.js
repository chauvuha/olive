import React, { useEffect, useState } from 'react';

const ShowAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log('Received data:', data); // Debug the data
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Support Network</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => {
            console.log(`User ${user.name} support network:`, user.support_network);
            return (
              <li key={user._id}>
                <h2>{user.name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone_number}</p>
                <p><strong>Conditions/Concerns:</strong> {user.conditions}</p>
                <h3>Support Network:</h3>
                {user.support_network && user.support_network.length > 0 ? (
                  <ul>
                    {user.support_network.map((member) => (
                      <li key={member._id || member.name}>
                        <p><strong>Name:</strong> {member.name}</p>
                        <p><strong>Relation:</strong> {member.relation}</p>
                        <p><strong>Email:</strong> {member.email}</p>
                        <p><strong>Phone:</strong> {member.phone_number}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No support network members found.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ShowAllUsers;