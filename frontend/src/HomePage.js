import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
function HomePage() {
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("PATIENT");
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("Login function triggered");

    try {
      const res = await fetch("http://localhost:7000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Always attempt to parse JSON, even if res.ok is false, to get error details
      const data = await res.json();

      if (!res.ok) {
        // If response is not OK, it's an error from the backend
        const errorMsg = data.error || "Login failed due to an unknown error.";
        throw new Error(errorMsg);
      }

      // If response is OK, it should be a LoginResponse object
      const token = data.jwt; // Access 'jwt' field directly from LoginResponse
      const userRole = data.role; // Access 'role' field directly from LoginResponse

      if (!token) throw new Error("No token returned from server.");

      localStorage.setItem("jwt", token);
      localStorage.setItem("role", userRole); // Store the role from the backend response

      // Decode token to verify, but rely on backend's 'role' for navigation
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);

      if (userRole === "ROLE_PATIENT") {
        navigate("/patient/home");
      } else if (userRole === "ROLE_DOCTOR") {
        navigate("/doctor/home");
      } else if (userRole === "ROLE_ADMIN") {
        navigate("/admin/home");
      } else {
        navigate("/"); // Fallback if role is unexpected
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message);
    }
  };

  const handleSignup = async () => {
    console.log("Signup function triggered");

    try {
      const res = await fetch("http://localhost:7000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, phoneNumber, role }),
      });

    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.error || "Signup failed due to an unknown error.");
    }

      alert(data.message || "Signup successful! You can now log in.");
      setShowLogin(true); // Switch to login view after successful signup
      // Clear form fields
      setUsername("");
      setPassword("");
      setPhoneNumber("");
      setRole("PATIENT");
    } catch (err) {
      console.error("Signup error:", err);
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MediSync</h1>
        <h2 style={styles.heading}>{showLogin ? "Login" : "Sign Up"}</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {!showLogin && (
          <>
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={styles.input}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </>
        )}

        <button
          onClick={showLogin ? handleLogin : handleSignup}
          style={styles.button}
        >
          {showLogin ? "Login" : "Sign Up"}
        </button>

        <p style={styles.switch}>
          {showLogin ? (
            <>
              Don’t have an account?{" "}
              <span style={styles.link} onClick={() => setShowLogin(false)}>
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span style={styles.link} onClick={() => setShowLogin(true)}>
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#F0FFF4",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#E8F5E9",
    padding: "40px",
    borderRadius: "15px",
    width: "350px",
    boxShadow: "0 4px 20px rgba(46,125,50,0.15)",
    textAlign: "center",
    animation: "fadeIn 0.6s ease-in-out",
  },
  title: {
    fontSize: "2.5rem",
    color: "#2E7D32",
    marginBottom: "15px",
    textShadow: "0 0 6px rgba(46,125,50,0.2)",
    fontWeight: "bold",
  },
  heading: {
    color: "#388E3C",
    fontSize: "1.5rem",
    marginBottom: "25px",
    fontWeight: "500",
  },
  input: {
    padding: "12px",
    margin: "8px 0",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #A5D6A7",
    backgroundColor: "#FFFFFF",
    color: "#2E7D32",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s",
  },
  select: {
    padding: "12px",
    margin: "8px 0",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #A5D6A7",
    backgroundColor: "#FFFFFF",
    color: "#2E7D32",
    fontSize: "1rem",
    cursor: "pointer",
    outline: "none",
  },
  button: {
    padding: "12px",
    backgroundColor: "#66BB6A",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    width: "100%",
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginTop: "15px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 8px rgba(102,187,106,0.4)",
  },
  switch: {
    marginTop: "15px",
    color: "#4CAF50",
  },
  link: {
    color: "#2E7D32",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "underline",
  },
};

export default HomePage;
