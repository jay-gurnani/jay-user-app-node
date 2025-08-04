import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";

// const BASE_URL = "http://localhost:8000"; //Fast Api
// const BASE_URL = "https://qg7fzpae5k.execute-api.ap-south-1.amazonaws.com/dev"; //Serverless
// const BASE_URL = "https://zmt4k4ugpe.execute-api.ap-south-1.amazonaws.com/Prod"; //SAM
// const BASE_URL = "https://xmrp6sr5c1.execute-api.ap-south-1.amazonaws.com"; //Manual
// const BASE_URL = "https://mhlis6pxc3.execute-api.ap-south-1.amazonaws.com"; //ec2
// const BASE_URL = "https://aq4lr16810.execute-api.ap-south-1.amazonaws.com/dev2"; //Nodejs
const BASE_URL = "http://localhost:3000"; 
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const { sub } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedFileInfo, setSelectedFileInfo] = useState("");
  const [form, setForm] = useState({
    name: "",
    gender: "",
    height: "",
    bio: "",
    dob: ""
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const loggedInSub = decoded.sub;
  const isViewingOwnProfile = !sub || sub === loggedInSub;
  

  useEffect(() => {
    const fetchData = async () => {
      const url = isViewingOwnProfile
        ? `${BASE_URL}/profile`
        : `${BASE_URL}/profile/${sub}`;
      const imageurl = isViewingOwnProfile
        ? `${BASE_URL}/get-image`
        : `${BASE_URL}/get-image/${sub}`;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return null;
        }
        // Fetch profile
        const profileRes = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);
        setForm(profileRes.data);
        setIsEditing(false); // View mode

        // Fetch image
        const imageRes = await axios.get(imageurl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setImageUrl(imageRes.data.url);

        // Decode token to check for admin role
        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles = payload["cognito:groups"] || [];
        setIsAdmin(roles.includes("admin"));

      } catch (err) {
        if (err.response?.status === 404) {
        console.warn("Profile not found. Initializing new form.");
        setIsEditing(true); // Start in edit mode for new users
        setProfile({});
        setForm({
          name: "",
          gender: "",
          height: "",
          bio: "",
          dob: ""
        });
      } else if(err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/";
        } else {
          console.error("Error fetching profile:", err);
        }
      }
      // Always try to fetch the image
      try {
        const token = localStorage.getItem("token");
        const imageRes = await axios.get(imageurl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setImageUrl(imageRes.data.url);
      } catch (imgErr) {
        console.warn("Image not found or failed to fetch.");
      }
    };

    fetchData();
  }, [sub, loggedInSub, isViewingOwnProfile, navigate]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const token = localStorage.getItem("token");

      try {
        const res = await axios.post(`${BASE_URL}/upload-image`, {
          "file-data": base64
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        setImageUrl(res.data.url);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };

    reader.readAsDataURL(file);
  };
  
  const handleListUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = JSON.parse(res.data.body);
      setAllUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const openProfile = (sub) => {
    navigate(`/profile/${sub}`);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>User Profile</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="User"
          style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
        />
      )}

      {isEditing && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Update Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {selectedFileInfo && (
            <p style={{ marginTop: 5, color: "#555" }}>
              Selected: <strong>{selectedFileInfo.name}</strong> ({selectedFileInfo.size})
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {["name", "gender", "height", "bio", "dob"].map((field) => (
          <div key={field} style={{ marginBottom: 10 }}>
            <label style={{ display: "block" }}>{field.toUpperCase()}</label>
            <input
              name={field}
              value={form[field]}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        ))}
      </div>
      
      {isViewingOwnProfile && (
      <div style={{ marginTop: 20 }}>
        {isEditing ? (
          <>
            <button onClick={handleSave}>Save</button>{" "}
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={handleEditToggle}>Edit</button>
        )}
      </div>
      )}
      
      
      {isAdmin && (
      <div style={{ marginTop: 30 }}>
        <hr />
        <h3>Admin Controls</h3>
        <button onClick={handleListUsers}>List All Users</button>

        {allUsers.length > 0 && (
          <ul style={{ marginTop: 10 }}>
            {allUsers.map((user) => (
              <li key={user.user_id} style={{ listStyle: "none", marginBottom: 5 }}>
                <button
                  onClick={() => openProfile(user.user_id)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#2563EB", // Tailwind's blue-600
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "1rem",
                  }}
                >
                  {user.name || user.user_id}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}
    </div>
  );
}