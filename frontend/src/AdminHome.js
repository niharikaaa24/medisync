import React from "react";
import { useNavigate } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <p style={styles.subtitle}>Manage users and appointments</p>

      <div style={styles.cardContainer}>
        <div style={styles.card} onClick={() => navigate("/admin/users")}>
          👥 View Users
        </div>
        <div style={styles.card} onClick={() => navigate("/admin/appointments")}>
          📅 View Appointments
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#F0FFF4", // Soft mint background
    minHeight: "100vh",
    color: "#2E7D32", // Deep green text
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#2E7D32", // Deep green
    textShadow: "0 0 6px rgba(46,125,50,0.2)",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#388E3C", // Medium green
    marginBottom: "30px",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    flex: "0 1 250px",
    background: "#E8F5E9", // Light green card
    padding: "25px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(46,125,50,0.15)",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.2rem",
    transition: "all 0.3s ease-in-out",
    color: "#2E7D32",
  },
};

export default AdminHome;
