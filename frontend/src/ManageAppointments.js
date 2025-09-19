import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate if not already there

function ManageAppointments() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});
  const [error, setError] = useState(null); // State for general errors

  // Function to fetch all appointments and user details
  const fetchAppointmentsAndUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt");

    if (!token) {
      setError("Authentication required. Please log in as an Admin.");
      setLoading(false);
      navigate("/login"); // Redirect to login if no token
      return;
    }

    try {
      // Fetch all appointments
      const appRes = await fetch("http://localhost:7070/appointment/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT token
        },
      });

      if (!appRes.ok) {
        const errorText = await appRes.text();
        throw new Error(`Failed to fetch appointments: ${appRes.status} - ${errorText}`);
      }
      const appData = await appRes.json();
      setAppointments(appData);

      // Collect unique patient and doctor IDs
      const ids = new Set();
      appData.forEach((a) => {
        if (a.patientId) ids.add(a.patientId);
        if (a.doctorId) ids.add(a.doctorId);
      });

      const idArray = Array.from(ids);
      const map = {};

      // Fetch usernames for each ID
      await Promise.all(
        idArray.map(async (id) => {
          try {
            // Use the /user/{id} endpoint to get user details by ID
            const userRes = await fetch(`http://localhost:7070/user/${id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Send JWT token
              },
            });
            if (userRes.ok) {
              const user = await userRes.json();
              map[id] = user.username || id; // Prefer username, fallback to ID
            } else {
              map[id] = `Unknown User (${id})`; // Indicate if user not found
            }
          } catch (userFetchErr) {
            console.error(`Error fetching user ${id}:`, userFetchErr);
            map[id] = `Error User (${id})`; // Indicate error
          }
        })
      );
      setUserMap(map);
    } catch (err) {
      console.error("Error during data fetch:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndUsers();
  }, []); // Run once on component mount

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return; // User cancelled
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Authentication required. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:7070/appointment/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT token
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete appointment: ${res.status} - ${errorText}`);
      }

      alert("Appointment deleted successfully!");
      // Refresh the list after deletion
      fetchAppointmentsAndUsers();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Error deleting appointment: " + err.message);
    }
  };

  if (loading) return <p style={styles.loading}>Loading appointments...</p>;
  if (error) return <p style={{ ...styles.loading, color: 'red' }}>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Appointments List (Admin View)</h2>
      {appointments.length === 0 ? (
        <p style={styles.noData}>No appointments found.</p>
      ) : (
        <div style={styles.grid}>
          {appointments.map((app) => (
            <div key={app.id || app._id} style={styles.card}>
              <p>
                <strong>ID:</strong> {app.id || app._id}
              </p>
              <p>
                <strong>Date:</strong> {app.appointmentDate}
              </p>
              <p>
                <strong>Time:</strong> {app.appointmentTime}
              </p>
              <p>
                <strong>Patient:</strong> {userMap[app.patientId] || app.patientId}
              </p>
              <p>
                <strong>Doctor:</strong> {userMap[app.doctorId] || app.doctorId}
              </p>
              {app.reason && (
                <p>
                  <strong>Reason:</strong> {app.reason}
                </p>
              )}
              <p>
                <strong>Status:</strong> {app.status}
              </p>
              <button
                style={styles.deleteButton}
                onClick={() => handleDeleteAppointment(app.id || app._id)}
              >
                Delete Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#F0FFF4", // soft mint background
    minHeight: "100vh",
    color: "#2F4F4F",
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "25px",
    color: "#2E7D32", // deep green
    textShadow: "0 0 4px rgba(46,125,50,0.3)",
  },
  loading: {
    textAlign: "center",
    color: "#2E7D32",
    marginTop: "40px",
  },
  noData: {
    textAlign: "center",
    color: "#666",
    fontSize: "1.2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#E8F5E9", // light green card
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(46,125,50,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative", // For positioning the button
  },
  deleteButton: {
    backgroundColor: "#DC3545", // Red color for delete
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "15px", // Spacing from other content
    width: "100%", // Full width button
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#C82333", // Darker red on hover
    },
  },
};

export default ManageAppointments;