import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "./LoginPage";
import { useNavigate } from "react-router-dom";
import AWSXRay from 'aws-xray-sdk-core';

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
  const traceId = segment?.trace_id || 'no-trace-id';
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.post(`${BASE_URL}/confirm-forgot-password`, {
        username: email,
        confirmationCode,
        newPassword,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(`[trace-id: ${traceId}]`,err);
      setError(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Verification Code"
          required
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Reset Password
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default ResetPasswordForm;
