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
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
      },{
        headers: {
            "Content-Type": "application/json"
        }
      });
      const data = res.data?.body? JSON.parse(res.data.body): res.data;
      const token = data.id_token? data.id_token: data.idToken;
      // const token = res.data.id_token; // assuming response has { token: "JWT..." }
      localStorage.setItem("token", token);
      navigate("/profile");
    } catch (err) {
      console.error(err);
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
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      <p>
        Don’t have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        </p>
    </div>
  );
}

export default LoginPage;