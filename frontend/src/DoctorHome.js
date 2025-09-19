import React from "react";
import { useNavigate } from "react-router-dom";

function DoctorHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Doctor Dashboard</h1>
      <p style={styles.subtitle}>
        Manage appointments and patient health records.
      </p>

      <div style={styles.cardContainer}>
        <div
          style={styles.card}
          onClick={() => navigate("/doctor/appointments")}
        >
          🗓 View & Manage Appointments
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#F0FFF4", // soft mint background
    minHeight: "100vh",
    color: "#2F4F4F",
    position: "relative",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#2E7D32", // deep green
    textAlign: "center",
    textShadow: "0 0 4px rgba(46,125,50,0.3)",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#4F7942",
    textAlign: "center",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    flex: "1 1 250px",
    backgroundColor: "#E8F5E9", // light green card
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(46,125,50,0.1)",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.1rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};

export default DoctorHome;