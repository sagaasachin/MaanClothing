import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

// 🛒 Add to cart
router.post("/add", protect, addToCart);

// ❌ Remove from cart
router.post("/remove", protect, removeFromCart);

// 📦 Get current user's cart
router.get("/", protect, getCart);

export default router;
