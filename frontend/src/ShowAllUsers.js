import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const ShowAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        console.log("Received data:", data); // Debug the data
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Dropdown Toggle State
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index); // Toggle the dropdown visibility
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="main-box">
      <div className="back">
      <Link to="/homepage" className="back-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M17.9209 1.50495C17.9206 1.90264 17.7623 2.28392 17.4809 2.56495L9.80895 10.237C9.57673 10.4691 9.39252 10.7447 9.26684 11.0481C9.14117 11.3515 9.07648 11.6766 9.07648 12.005C9.07648 12.3333 9.14117 12.6585 9.26684 12.9618C9.39252 13.2652 9.57673 13.5408 9.80895 13.773L17.4709 21.435C17.7442 21.7179 17.8954 22.0968 17.892 22.4901C17.8885 22.8834 17.7308 23.2596 17.4527 23.5377C17.1746 23.8158 16.7983 23.9735 16.405 23.977C16.0118 23.9804 15.6329 23.8292 15.3499 23.556L7.68795 15.9C6.65771 14.8677 6.0791 13.4689 6.0791 12.0105C6.0791 10.552 6.65771 9.15322 7.68795 8.12095L15.3599 0.443953C15.5697 0.234037 15.8371 0.0910666 16.1281 0.0331324C16.4192 -0.0248017 16.7209 0.00490445 16.9951 0.118492C17.2692 0.232079 17.5036 0.424443 17.6684 0.671242C17.8332 0.918041 17.9211 1.20818 17.9209 1.50495Z"
            fill="#2E2E2E"
          />
        </svg>
      </Link>
    </div>
      <h1>Support Network</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div>
          {users.map((user, userIndex) => {
            console.log(
              `User ${user.name} support network:`,
              user.support_network
            );
            return (
              <div key={user._id}>
                {user.support_network && user.support_network.length > 0 ? (
                  <div>
                    {user.support_network.map((member, memberIndex) => (
                      <div key={member._id || member.name}>
                        <div style={{ marginBottom: "15px" }}></div>{" "}
                        {/* Visual space between the dropdowns */}
                        <p
                          style={{ cursor: "pointer" }}
                          onClick={() => handleDropdownToggle(memberIndex)}
                        >
                          <strong>{member.name}</strong>
                        </p>
                        {/* If the dropdown is open, display the details */}
                        {openDropdown === memberIndex && (
                          <div style={{ marginLeft: "20px" }}>
                            <p>
                              <strong>Relation:</strong> {member.relation}
                            </p>
                            {/* <p>
                              <strong>Email:</strong> {member.email}
                            </p> */}
                            <p>
                              <strong>Phone:</strong> {member.phone_number}
                            </p>
                          </div>
                        )}
                        {/* Long line separation */}
                        <div
                          style={{
                            margin: "20px 0",
                            borderBottom: "2px solid #000",
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No support network members found.</p>
                )}
                <div className="logo-container">
                  <img src="olive2.png" alt="Logo" className="logo2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowAllUsers;
