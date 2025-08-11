import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "./LoginPage"; // assuming same file or update path
import { useNavigate } from "react-router-dom";
import AWSXRay from 'aws-xray-sdk-core';

function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
  const traceId = segment?.trace_id || 'no-trace-id';

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.post(`${BASE_URL}/forgot-password`, {
        username,
      });
      setMessage("Verification code sent to your email.");
      setTimeout(() => {
        navigate("/reset-password", { state: { username } });
      }, 2000);
    } catch (err) {
      console.error(`[trace-id: ${traceId}]`,err);
      setError(err.response?.data?.error || "Failed to send reset code.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgotPassword}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Send Reset Code
        </button>
      </form>
      {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}

export default ForgotPasswordPage;
