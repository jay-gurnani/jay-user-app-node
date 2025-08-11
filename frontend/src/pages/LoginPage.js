import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AWSXRay from 'aws-xray-sdk-core';

const isLocalhost = window.location.hostname === 'localhost';

// Use localhost API if running locally, else use the deployed API Gateway URL
export const BASE_URL = isLocalhost
  ? 'http://localhost:3000/api'
  : 'https://de0vedacxf.execute-api.ap-south-1.amazonaws.com/api';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
  const traceId = segment?.trace_id || 'no-trace-id';
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(`${BASE_URL}/login`, {
        username,
        password,
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      navigate("/profile");
    } catch (err) {
      console.error(`[trace-id: ${traceId}]`,err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Login
        </button>
      </form>

      {/* Forgot Password Link */}
      <p style={{ marginTop: 10 }}>
        <button 
          onClick={() => navigate("/forgot-password")} 
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer", padding: 0 }}
        >
          Forgot Password?
        </button>
      </p>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      <p>
        Don’t have an account?{" "}
        <button onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default LoginPage;
