import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PatientNoti() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("jwt");

      if (!token) {
        alert("You are not logged in. Please log in to view notifications.");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:7000/notification/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch notifications: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        setNotifications(data); // Assuming data is an array of notification objects
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
        alert("Error loading notifications: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Notifications</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/patient/home")} style={styles.errorButton}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Your Notifications</h1>
      <button onClick={() => navigate("/patient/home")} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      {notifications.length === 0 ? (
        <p style={styles.noNotifications}>You have no new notifications.</p>
      ) : (
        <div style={styles.notificationsList}>
          {notifications.map((notification) => (
            <div key={notification.id} style={styles.notificationCard}>
              <p style={styles.notificationMessage}>{notification.message}</p>
              <p style={styles.notificationTimestamp}>
                Received: {formatTimestamp(notification.timestamp)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#E3F2FD",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#1976D2", // Deep blue
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#2196F3", // Blue
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "20px",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#1976D2",
    },
  },
  notificationsList: {
    width: "100%",
    maxWidth: "600px", // Keep a max-width for better readability on large screens
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  notificationCard: {
    background: "#FFFFFF", // White card
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    borderLeft: "5px solid #2196F3",
  },
  notificationMessage: {
    fontSize: "1.1rem",
    color: "#333",
    marginBottom: "10px",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  },
  notificationTimestamp: {
    fontSize: "0.9rem",
    color: "#777",
    textAlign: "right",
  },
  noNotifications: {
    fontSize: "1.2rem",
    color: "#555",
    marginTop: "50px",
    textAlign: "center",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#E3F2FD',
    fontSize: '1.5rem',
    color: '#1976D2',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  errorButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#F44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#1976D2',
    animation: 'spin 1s ease infinite',
    marginBottom: '15px',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

export default PatientNoti;