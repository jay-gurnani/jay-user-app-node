import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
// import ImageUpload from './pages/ImageUpload';
// import AdminPage from './pages/AdminPage';

// Import login, profile, image later

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:sub" element={<ProfilePage />} />
        {/* <Route path="/upload-image" element={<ImageUpload />} />
        <Route path="/admin" element={<AdminPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
