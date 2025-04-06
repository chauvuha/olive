import React, { useState, useEffect } from 'react';

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

  // Dropdown Toggle State
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);  // Toggle the dropdown visibility
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="main-box">
      <h1>Support Network</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user, userIndex) => {
            console.log(`User ${user.name} support network:`, user.support_network);
            return (
              <div key={user._id}>
                {/* <h2>{user.name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone_number}</p>
                <p><strong>Conditions/Concerns:</strong> {user.conditions}</p> */}
                
                {/* <h3>Support Network:</h3> */}

                {user.support_network && user.support_network.length > 0 ? (
                  <div>
                    {user.support_network.map((member, memberIndex) => (
                      <div key={member._id || member.name}>
                        <div style={{ marginBottom: '15px' }}></div> {/* Visual space between the dropdowns */}

                        <p style={{ cursor: 'pointer' }} onClick={() => handleDropdownToggle(memberIndex)}>
                          <strong>{member.name}</strong>
                        </p>

                        {/* If the dropdown is open, display the details */}
                        {openDropdown === memberIndex && (
                          <div style={{ marginLeft: '20px' }}>
                            <p><strong>Relation:</strong> {member.relation}</p>
                            <p><strong>Email:</strong> {member.email}</p>
                            <p><strong>Phone:</strong> {member.phone_number}</p>
                          </div>
                        )}

                        {/* Long line separation */}
                        <div style={{ margin: '20px 0', borderBottom: '2px solid #000' }}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No support network members found.</p>
                )}
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ShowAllUsers;
