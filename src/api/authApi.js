import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // example: https://maanclothing-1.onrender.com/api
  withCredentials: true,
});

export const loginUser = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};
