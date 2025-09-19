import React from "react";
import { useNavigate } from "react-router-dom";

function PatientHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Patient Dashboard</h1>
      <p style={styles.subtitle}>
        Welcome! Here’s your personalized health hub.
      </p>

      <div style={styles.cardContainer}>
        <div
          style={styles.card}
          onClick={() => navigate("/appointments")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-5px)";
            e.target.style.boxShadow = "0 8px 20px rgba(76, 175, 80, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 6px 15px rgba(76, 175, 80, 0.2)";
          }}
        >
          📅 View Appointments
        </div>

        <div
          style={styles.card}
          onClick={() => navigate("/book-appointment")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-5px)";
            e.target.style.boxShadow = "0 8px 20px rgba(76, 175, 80, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 6px 15px rgba(76, 175, 80, 0.2)";
          }}
        >
          ➕ Book New Appointment
        </div>
      </div>
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
    justifyContent: "center",
    position: "relative",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#2E7D32", // Deep green
    textAlign: "center",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#66BB6A", // Softer green
    marginBottom: "30px",
    textAlign: "center",
  },
  cardContainer: {
    display: "flex",
    gap: "30px",
    marginTop: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    flex: "0 1 280px",
    background: "#FFFFFF", // White card
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 6px 15px rgba(76, 175, 80, 0.2)", // Green shadow
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.3rem",
    color: "#1B5E20", // Dark green text
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  },
};

export default PatientHome;