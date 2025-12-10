import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();
connectDB();

const app = express();

// CORS CONFIG
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://maanclothing-2.onrender.com", // frontend
      "https://maanclothing-1.onrender.com", // backend
    ],
    credentials: true,
  })
);


// Body parser
app.use(express.json());

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);

// Health check route
app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
