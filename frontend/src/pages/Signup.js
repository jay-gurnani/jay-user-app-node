import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:8000"; //Fast Api
// const BASE_URL = "https://qg7fzpae5k.execute-api.ap-south-1.amazonaws.com/dev"; //Serverless
// const BASE_URL = "https://zmt4k4ugpe.execute-api.ap-south-1.amazonaws.com/Prod"; //SAM
// const BASE_URL = "https://xmrp6sr5c1.execute-api.ap-south-1.amazonaws.com"; //Manual
// const BASE_URL = "https://mhlis6pxc3.execute-api.ap-south-1.amazonaws.com"; //ec2
// const BASE_URL = "https://aq4lr16810.execute-api.ap-south-1.amazonaws.com/dev2"; //Nodejs
const BASE_URL = "http://localhost:3000"; 
const Signup = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  // Inside your component
const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

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
      alert(err.response?.data?.error || "Signup failed");
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
