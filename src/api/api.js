import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Example: https://your-backend.onrender.com/api
  withCredentials: true,
});

// ===============================
// 🛍️ PRODUCTS (Public)
// ===============================
export const fetchProducts = async (category = "", search = "") => {
  try {
    const { data } = await API.get(
      `/products?category=${category}&search=${search}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// ===============================
// 👤 AUTH
// ===============================
export const registerUser = async (userData) => {
  try {
    const { data } = await API.post("/auth/register", userData);
    return data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const { data } = await API.post("/auth/login", credentials);
    return data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchUserProfile = async (token) => {
  try {
    const { data } = await API.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error(
      "Profile fetch error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// PLACEHOLDER CART/WISHLIST API
export const fetchCart = async () => [];
export const addToCart = async () => {};
export const removeFromCart = async () => {};
export const fetchWishlist = async () => [];
export const addToWishlist = async () => {};
export const removeFromWishlist = async () => {};

export default API;
