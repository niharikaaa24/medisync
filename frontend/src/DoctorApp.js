import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorApp() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [mainError, setMainError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const appointmentStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "SUCCESS"];

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    setMainError(null);
    const token = localStorage.getItem("jwt");

    if (!token) {
      setMainError("Authentication required. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:7070/appointment/doctor", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch appointments: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
      setMainError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [navigate]);

  const handleViewDetails = async (id) => {
    setDetailLoading(true);
    setSelectedAppointment(null);
    setDetailError(null);
    setIsEditing(false);
    const token = localStorage.getItem("jwt");

    if (!token) {
      setDetailError("Authentication required. Please log in.");
      setDetailLoading(false);
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:7070/appointment/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch appointment details: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      if (data) {
        setSelectedAppointment(data);
        setNewStatus(data.status);
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

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || !newStatus) {
      alert("No appointment selected or new status not chosen.");
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Authentication required. Please log in.");
      navigate("/login");
      return;
    }

    // FIX: Create a complete updatedAppointment object with the new status
    const updatedAppointment = {
      ...selectedAppointment,
      status: newStatus,
    };

    try {
      const res = await fetch(`http://localhost:7070/appointment/${selectedAppointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedAppointment),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update appointment status.");
      }

      const updatedData = await res.json();
      alert("Appointment status updated successfully!");
      setSelectedAppointment(updatedData);
      setIsEditing(false);

      fetchDoctorAppointments();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Error updating status: " + err.message);
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
        <button onClick={() => navigate("/doctor/home")} style={styles.errorButton}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Your Appointments</h1>
      <button onClick={() => navigate("/doctor/home")} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      {appointments.length === 0 ? (
        <p style={styles.noAppointments}>No appointments found.</p>
      ) : (
        <div style={styles.appointmentsList}>
          {appointments.map((app) => (
            <div
              key={app.id || app._id}
              style={styles.appointmentCard}
              onClick={() => handleViewDetails(app.id || app._id)}
            >
              <p>
                <strong style={styles.cardLabel}>Date:</strong> {app.appointmentDate}
              </p>
              <p>
                <strong style={styles.cardLabel}>Time:</strong> {app.appointmentTime}
              </p>
              <p>
                <strong style={styles.cardLabel}>Patient ID:</strong> {app.patientId}
              </p>
              <p>
                <strong style={styles.cardLabel}>Reason:</strong> {app.reason}
              </p>
              <p>
                <strong style={styles.cardLabel}>Status:</strong> {app.status}
              </p>
              <span style={styles.viewDetails}>View Details / Edit Status →</span>
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
            <strong>ID:</strong> {selectedAppointment.id}
          </p>
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
            <strong>Current Status:</strong> {selectedAppointment.status}
          </p>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Status
            </button>
          ) : (
            <div style={styles.editForm}>
              <label style={styles.label}>
                New Status:
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={styles.input}
                >
                  {appointmentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={handleUpdateStatus} style={styles.saveButton}>
                Save Status
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{ ...styles.cancelButton, marginLeft: "10px" }}
              >
                Cancel
              </button>
            </div>
          )}
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
    color: "#1976D2",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#2196F3",
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
    borderLeft: "5px solid #2196F3",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
    },
  },
  cardLabel: {
    color: "#1976D2",
  },
  viewDetails: {
    display: "block",
    marginTop: "10px",
    textAlign: "right",
    color: "#0D47A1",
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
    border: "1px solid #2196F3",
    borderRadius: "8px",
    backgroundColor: "#EBF5FF",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  detailTitle: {
    fontSize: "1.8rem",
    color: "#1976D2",
    marginBottom: "15px",
    borderBottom: "1px solid #2196F3",
    paddingBottom: "10px",
  },
  detailStatus: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#555",
  },
  editButton: {
    backgroundColor: "#FFC107",
    color: "black",
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "15px",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#FFB300",
    },
  },
  editForm: {
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  label: {
    fontSize: "1rem",
    color: "#333",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#43A047",
    },
  },
  cancelButton: {
    backgroundColor: "#F44336",
    color: "white",
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#D32F2F",
    },
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

export default DoctorApp;