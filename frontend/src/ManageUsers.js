import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function ManageUsers() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for general errors

  // State for editing functionality
  const [editingUser, setEditingUser] = useState(null); // Stores the user object being edited
  const [editedUserData, setEditedUserData] = useState({ // Stores form data for editing
    username: "",
    phoneNumber: "",
    role: "",
  });

  // Define possible roles (should match your Java Role enum values)
  const userRoles = ["PATIENT", "DOCTOR", "ADMIN"];

  // Function to fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt"); // Get JWT token

    if (!token) {
      setError("Authentication required. Please log in as an Admin.");
      setLoading(false);
      navigate("/login"); // Redirect to login if no token
      return;
    }

    try {
      const res = await fetch("http://localhost:7000/user/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT token
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch users: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Run once on component mount

  // Handle edit button click
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditedUserData({
      username: user.username,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  };

  // Handle input changes in the edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle saving edited user data
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Authentication required. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:7000/user/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editedUserData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user.");
      }

      alert("User updated successfully!");
      setEditingUser(null); // Exit edit mode
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user: " + err.message);
    }
  };

  // Handle deleting a user
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return; // User cancelled
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Authentication required. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:7000/user/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT token
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete user: ${res.status} - ${errorText}`);
      }

      alert("User deleted successfully!");
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user: " + err.message);
    }
  };

  if (loading) return <p style={styles.loading}>Loading users...</p>;
  if (error) return <p style={{ ...styles.loading, color: 'red' }}>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Manage Users</h2>
      {users.length === 0 ? (
        <p style={styles.noData}>No users found.</p>
      ) : (
        <div style={styles.grid}>
          {users.map((user) => (
            <div key={user.id || user._id} style={styles.card}>
              {editingUser && editingUser.id === user.id ? (
                // Edit form when in editing mode
                <div style={styles.editForm}>
                  <label style={styles.label}>
                    Username:
                    <input
                      type="text"
                      name="username"
                      value={editedUserData.username}
                      onChange={handleEditInputChange}
                      style={styles.input}
                    />
                  </label>
                  <label style={styles.label}>
                    Phone:
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editedUserData.phoneNumber}
                      onChange={handleEditInputChange}
                      style={styles.input}
                    />
                  </label>
                  <label style={styles.label}>
                    Role:
                    <select
                      name="role"
                      value={editedUserData.role}
                      onChange={handleEditInputChange}
                      style={styles.select}
                    >
                      {userRoles.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {roleOption}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div style={styles.buttonGroup}>
                    <button onClick={handleSaveEdit} style={styles.saveButton}>
                      Save
                    </button>
                    <button onClick={() => setEditingUser(null)} style={styles.cancelButton}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <>
                  <h3 style={styles.username}>{user.username}</h3>
                  <p>ID: {user.id || user._id}</p>
                  <p>Phone: {user.phoneNumber}</p>
                  <span style={{ ...styles.roleTag, ...getRoleStyle(user.role) }}>
                    {user.role}
                  </span>
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => handleEditClick(user)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user.id || user._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Dynamic role color styles (assuming roles are "PATIENT", "DOCTOR", "ADMIN" from backend)
const getRoleStyle = (role) => {
  switch (role) {
    case "ADMIN":
      return { backgroundColor: "#FFEBEE", color: "#C62828" }; // Light red, dark red text
    case "DOCTOR":
      return { backgroundColor: "#E8F5E9", color: "#2E7D32" }; // Light green, deep green text
    case "PATIENT":
      return { backgroundColor: "#E3F2FD", color: "#1976D2" }; // Light blue, deep blue text
    default:
      return { backgroundColor: "#CFD8DC", color: "#455A64" }; // Grey, dark grey text
  }
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#F0FFF4", // soft mint background
    minHeight: "100vh",
    color: "#2F4F4F", // dark slate gray for text
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "25px",
    color: "#2E7D32", // deep green
    textShadow: "0 0 4px rgba(46,125,50,0.3)",
    fontWeight: "bold",
  },
  loading: {
    textAlign: "center",
    color: "#2E7D32",
    marginTop: "40px",
    fontSize: "1.2rem",
  },
  noData: {
    textAlign: "center",
    color: "#666",
    fontSize: "1.2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Slightly wider cards
    gap: "20px",
  },
  card: {
    backgroundColor: "#FFFFFF", // White card for better contrast
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(46,125,50,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    color: "#333", // Darker text for readability
    fontWeight: "normal",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  username: {
    fontSize: "1.4rem",
    color: "#2E7D32",
    marginBottom: "10px",
  },
  roleTag: {
    padding: "5px 10px",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "0.9rem",
    alignSelf: "flex-start", // Align tag to the left
    marginBottom: "10px",
  },
  buttonGroup: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end", // Align buttons to the right
  },
  editButton: {
    backgroundColor: "#FFC107", // Amber
    color: "black",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#FFB300",
    },
  },
  deleteButton: {
    backgroundColor: "#F44336", // Red
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#D32F2F",
    },
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "0.9rem",
    color: "#555",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
    marginTop: "5px",
  },
  select: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
    marginTop: "5px",
  },
  saveButton: {
    backgroundColor: "#4CAF50", // Green
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#43A047",
    },
  },
  cancelButton: {
    backgroundColor: "#9E9E9E", // Grey
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#757575",
    },
  },
};

export default ManageUsers;