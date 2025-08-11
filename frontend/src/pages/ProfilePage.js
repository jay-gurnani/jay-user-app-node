import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";

const isLocalhost = window.location.hostname === 'localhost';

// Use localhost API if running locally, else use the deployed API Gateway URL
export const BASE_URL = isLocalhost
  ? 'http://localhost:3000/api'
  : 'https://de0vedacxf.execute-api.ap-south-1.amazonaws.com/api';

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
  const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(!sub);

  useEffect( () => {   
    const fetchData = async () => {
      try {
        const loggedInUser = await fetchLoggedInUser();
        const loggedInSub = loggedInUser.sub;
        const roles = loggedInUser.roles || [];

        setIsAdmin(roles.includes("admin"));
        const viewingOwnProfile = !sub || sub === loggedInSub;
        setIsViewingOwnProfile(viewingOwnProfile);
        const url = viewingOwnProfile
        ? `${BASE_URL}/profile`
        : `${BASE_URL}/profile/${sub}`;
        const imgurl = viewingOwnProfile
        ? `${BASE_URL}/get-image`
        : `${BASE_URL}/get-image/${sub}`;
        // Fetch profile
        const profileRes = await axios.get(url, {
          withCredentials: true,
        });
        setProfile(profileRes.data);
        setForm(profileRes.data);
        setIsEditing(false); // View mode

        // Fetch image
        const imageRes = await axios.get(imgurl, {
          withCredentials: true
        });
        setImageUrl(imageRes.data.url);

      } catch (err) {
        if (err.response?.status === 404) {
        console.warn("Profile not found. Initializing new form.");
        if (isViewingOwnProfile) {
          setIsEditing(true); // Start in edit mode for new users
          setProfile({});
          setForm({
            name: "",
            gender: "",
            height: "",
            bio: "",
            dob: ""
          });
        } else {
          setIsEditing(false); // View mode for other users
          setProfile(null);
        }
      } else if(err.response?.status === 401) {
          window.location.href = "/";
        } else {
          console.error("Error fetching profile:", err);
        }
      }
    };

    fetchData();
  }, [sub, navigate]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post(`${BASE_URL}/profile`, form, {
        withCredentials: true
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

  const formData = new FormData();
  formData.append("file", file); // backend expects 'file'

  try {
    const res = await axios.post(`${BASE_URL}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    });

    setImageUrl(res.data.url);
  } catch (err) {
    console.error("Image upload failed:", err);
  }
};

  const fetchLoggedInUser = async () => {
    const response = await axios.get(`${BASE_URL}/me`, {
      withCredentials: true,
    });
    return response.data;
  }
  const handleListUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/users`, {
        withCredentials: true
      });
      const body = res.data.body || res.data;
      const data = typeof body === 'string' ? JSON.parse(body) : body;
      setAllUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleLogout = async () => {
    await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
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