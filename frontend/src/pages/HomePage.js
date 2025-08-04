import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh", 
      background: "#f0f2f5" 
    }}>
      <h1>Welcome to the Profile App</h1>
      <p style={{ marginBottom: "30px" }}>Manage your profile, image and more securely.</p>

      <div style={{ display: "flex", gap: "20px" }}>
        <button 
          onClick={() => navigate("/login")}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Login
        </button>
        <button 
          onClick={() => navigate("/signup")}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
