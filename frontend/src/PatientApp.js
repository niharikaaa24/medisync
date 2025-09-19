import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function PatientApp() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [mainError, setMainError] = useState(null); // New state for main fetch error

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      setLoading(true);
      setMainError(null); // Clear previous errors
      const token = localStorage.getItem("jwt"); // Get JWT token

      if (!token) {
        setMainError("Authentication required. Please log in.");
        setLoading(false);
        navigate("/login"); // Redirect to login if no token
        return;
      }

      try {
        const res = await fetch("http://localhost:7070/appointment/patient", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Send JWT token
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch appointments: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setMainError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAppointments();
  }, [navigate]); // Add navigate to dependency array

  const handleClick = async (id) => {
    setDetailLoading(true);
    setSelectedAppointment(null); // Clear previously selected appointment
    setDetailError(null);
    const token = localStorage.getItem("jwt");

    if (!token) {
      setDetailError("Authentication required. Please log in.");
      setDetailLoading(false);
      navigate("/login");
      return;
    }

    try {
      // FIX: Fetch a specific appointment by ID
      const res = await fetch(`http://localhost:7070/appointment/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT token
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch appointment details: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      // The backend returns Optional<Appointment>, which JSON.parse will convert to the Appointment object if present, or null.
      // So, if data is null, it means Optional was empty.
      if (data) {
        setSelectedAppointment(data);
      } else {
        setDetailError("Appointment details not found.");
      }
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (mainError) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Appointments</h2>
        <p>{mainError}</p>
        <button onClick={() => navigate("/patient/home")} style={styles.errorButton}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Your Appointments</h1>
      <button onClick={() => navigate("/patient/home")} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      {appointments.length === 0 ? (
        <p style={styles.noAppointments}>No appointments found.</p>
      ) : (
        <div style={styles.appointmentsList}>
          {appointments.map((app) => (
            <div
              key={app.id || app._id} // Use app.id or app._id for key
              style={styles.appointmentCard}
              onClick={() => handleClick(app.id || app._id)}
            >
              <p>
                <strong style={styles.cardLabel}>Date:</strong> {app.appointmentDate}
              </p>
              <p>
                <strong style={styles.cardLabel}>Time:</strong> {app.appointmentTime}
              </p>
              <p>
                <strong style={styles.cardLabel}>Doctor ID:</strong> {app.doctorId}
              </p>
              <p>
                <strong style={styles.cardLabel}>Status:</strong> {app.status}
              </p>
              <span style={styles.viewDetails}>View Details →</span>
            </div>
          ))}
        </div>
      )}

      {detailLoading && <p style={styles.detailStatus}>Loading appointment details...</p>}
      {detailError && <p style={{ ...styles.detailStatus, color: "red" }}>Error: {detailError}</p>}

      {selectedAppointment && !detailLoading && !detailError && (
        <div style={styles.detailCard}>
          <h3 style={styles.detailTitle}>Appointment Details</h3>
          <p>
            <strong>Date:</strong> {selectedAppointment.appointmentDate}
          </p>
          <p>
            <strong>Time:</strong> {selectedAppointment.appointmentTime}
          </p>
          <p>
            <strong>Doctor ID:</strong> {selectedAppointment.doctorId}
          </p>
          <p>
            <strong>Patient ID:</strong> {selectedAppointment.patientId}
          </p>
          <p>
            <strong>Reason:</strong> {selectedAppointment.reason}
          </p>
          <p>
            <strong>Status:</strong> {selectedAppointment.status}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#E8F5E9", // Light green background
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#2E7D32", // Deep green
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#4CAF50", // Green
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "20px",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#43A047",
    },
  },
  appointmentsList: {
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  appointmentCard: {
    background: "#FFFFFF",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    borderLeft: "5px solid #4CAF50",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
    },
  },
  cardLabel: {
    color: "#2E7D32",
  },
  viewDetails: {
    display: "block",
    marginTop: "10px",
    textAlign: "right",
    color: "#1976D2", // Blue for link-like text
    fontWeight: "bold",
  },
  noAppointments: {
    fontSize: "1.2rem",
    color: "#555",
    marginTop: "50px",
    textAlign: "center",
  },
  detailCard: {
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #4CAF50",
    borderRadius: "8px",
    backgroundColor: "#F0FDF0", // Lighter green background for details
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  detailTitle: {
    fontSize: "1.8rem",
    color: "#2E7D32",
    marginBottom: "15px",
    borderBottom: "1px solid #4CAF50",
    paddingBottom: "10px",
  },
  detailStatus: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#555",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#E8F5E9',
    fontSize: '1.5rem',
    color: '#2E7D32',
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
    borderLeftColor: '#2E7D32',
    animation: 'spin 1s ease infinite',
    marginBottom: '15px',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

export default PatientApp;
