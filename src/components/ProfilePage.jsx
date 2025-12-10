// frontend/src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Paper,
} from "@mui/material";
import { toast} from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// ⭐ THIS MUST MATCH YOUR backend
const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE, // ⭐ Always calls https://maanclothing-1.onrender.com/api
  timeout: 10000,
});

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ⭐ ALWAYS calls correct API
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return navigate("/login");

      setLoading(true);

      try {
        const res = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);

        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          gender: res.data.gender || "",
          dob: res.data.dob ? res.data.dob.split("T")[0] : "",
        });
      } catch (error) {
        console.error("Profile Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired — login again");
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      const res = await api.put("/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated");
      setUser(res.data.user);
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  if (loading)
    return (
      <Box
        height="80vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );

  if (!user)
    return (
      <Typography textAlign="center" mt={5}>
        No profile found — please login
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
      
      <Typography
        sx={{ cursor: "pointer", color: "#1976d2", mb: 2 }}
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar sx={{ width: 100, height: 100, mx: "auto" }} />
        </Box>

        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={!editMode}
        />

        <TextField
          label="Email"
          value={formData.email}
          fullWidth
          margin="normal"
          disabled
        />

        <TextField
          label="Phone"
          name="phone"
          fullWidth
          margin="normal"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={!editMode}
        />

        <TextField
          label="Address"
          name="address"
          fullWidth
          margin="normal"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          disabled={!editMode}
        />

        <TextField
          label="Gender"
          name="gender"
          fullWidth
          margin="normal"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          disabled={!editMode}
        />

        <TextField
          label="Date of Birth"
          type="date"
          name="dob"
          fullWidth
          margin="normal"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          disabled={!editMode}
          InputLabelProps={{ shrink: true }}
        />

        <Box mt={3} textAlign="center">
          {!editMode ? (
            <Button variant="contained" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                sx={{ mr: 2 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
console.log("ENV BASE URL =", import.meta.env.VITE_API_URL);

export default ProfilePage;
