import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ===============================
// 🛍️ PRODUCTS (Publicly Visible)
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
// 👤 AUTHENTICATION
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
    console.error("Profile fetch error:", error.response?.data || error.message);
    throw error;
  }
};

// ===============================
// ❤️ CART & WISHLIST (Protected)
// ===============================
// These routes will be activated later once you add backend support.
export const fetchCart = async (userId) => {
  console.warn("Cart API not implemented yet");
  return [];
};

export const addToCart = async (userId, productId) => {
  console.warn("Add to cart API not implemented yet");
  return;
};

export const removeFromCart = async (userId, productId) => {
  console.warn("Remove from cart API not implemented yet");
  return;
};

export const fetchWishlist = async (userId) => {
  console.warn("Wishlist API not implemented yet");
  return [];
};

export const addToWishlist = async (userId, productId) => {
  console.warn("Add to wishlist API not implemented yet");
  return;
};

export const removeFromWishlist = async (userId, productId) => {
  console.warn("Remove from wishlist API not implemented yet");
  return;
};
