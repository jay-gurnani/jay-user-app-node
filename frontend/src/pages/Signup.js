import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AWSXRay from 'aws-xray-sdk-core';
const isLocalhost = window.location.hostname === 'localhost';

// Use localhost API if running locally, else use the deployed API Gateway URL
export const BASE_URL = isLocalhost
  ? 'http://localhost:3000/api'
  : 'https://de0vedacxf.execute-api.ap-south-1.amazonaws.com/api';

const Signup = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
  const traceId = segment?.trace_id || 'no-trace-id';
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/signup`, {
        username: form.email, // frontend assigns username = email
        password: form.password,
        email: form.email
      });
      alert("Signed up! Check email for confirmation code.");
      setShowConfirm(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Signup failed";

      if (errorMsg.includes("User already exists")) {
        // Show confirm box for existing but unconfirmed user
        alert("User already exists. If not confirmed, please enter the confirmation code.");
        setShowConfirm(true);

        // Optionally: resend confirmation code here
        try {
          await axios.post(`${BASE_URL}/resend-code`, {
            username: form.email,
          });
          alert("Confirmation code resent!");
        } catch (resendErr) {
          console.error(`[trace-id: ${traceId}]`,"Resend failed:", resendErr.response?.data?.error || resendErr.message);
        }

      } else {
        alert(errorMsg);
      }
    }
  };

  const handleConfirm = async () => {
    try {
      await axios.post(`${BASE_URL}/confirm-code`, {
        username: form.email,
        code: confirmationCode,
      });
      alert("Confirmed! You can now log in.");
    } catch (err) {
      alert(err.response?.data?.error || "Confirmation failed");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${BASE_URL}/resend-code`, {
        username: form.email,
      });
      alert("Code resent!");
    } catch (err) {
      alert(err.response?.data?.error || "Resend failed");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Sign Up</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={handleChange}
        style={styles.input}
      />

      <button onClick={handleSignup} style={styles.button}>Sign Up</button>

      {showConfirm && (
        <>
          <h4 style={{ marginTop: 20 }}>Enter Confirmation Code</h4>
          <input
            placeholder="Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleConfirm} style={styles.button}>Confirm</button>
          <button onClick={handleResend} style={{ ...styles.button, backgroundColor: "#777" }}>
            Resend Code
          </button>
        </>
      )}

      <p>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")}>Login</button>
      </p>
    </div>
  );
};

const styles = {
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};

export default Signup;
