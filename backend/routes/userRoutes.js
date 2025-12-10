import express from "express";
import mongoose from "mongoose";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Order from "../models/Order.js";

const router = express.Router();

/* ============================================
   👤 USER PROFILE ROUTES
============================================ */

// GET USER PROFILE
router.get("/api/user/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("❌ Failed to fetch profile:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// UPDATE USER PROFILE
router.put("/api/user/profile", protect, async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;

    // Validation (optional)
    if (phone && !/^[0-9]{10}$/.test(phone))
      return res.status(400).json({ message: "Phone must be 10 digits" });
    if (gender && !["male", "female", "other"].includes(gender.toLowerCase()))
      return res.status(400).json({ message: "Invalid gender" });

    const updates = { name, phone, address, gender, dob };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Failed to update profile:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/* ============================================
   🛒 CART ROUTES
============================================ */

router.get("/cart", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );
    res.json(cart || { items: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

router.post("/cart", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid productId" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart)
      cart = new Cart({
        userId: req.user._id,
        items: [{ productId, quantity: 1 }],
      });
    else {
      const item = cart.items.find((i) => i.productId.toString() === productId);
      if (item) item.quantity += 1;
      else cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    res.json({ message: "Added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

router.put("/cart/:productId", protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.productId.toString() === req.params.productId
    );
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

router.delete("/cart/:productId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== req.params.productId
    );
    await cart.save();
    res.json({ message: "Removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

router.delete("/cart/clear", protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

/* ============================================
   ❤️ WISHLIST ROUTES
============================================ */

router.get("/wishlist", protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate(
      "products"
    );
    if (!wishlist)
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

router.post("/wishlist", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid productId" });

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist)
      wishlist = new Wishlist({ userId: req.user._id, products: [] });

    if (!wishlist.products.includes(productId))
      wishlist.products.push(productId);

    await wishlist.save();
    res.json({ message: "Added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

router.delete("/wishlist/:productId", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.productId
    );
    await wishlist.save();
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

/* ============================================
   🧾 ORDER ROUTES
============================================ */

router.post("/orders", protect, async (req, res) => {
  try {
    const { address, paymentType, upiId } = req.body;
    if (!address || !paymentType)
      return res
        .status(400)
        .json({ message: "Address & paymentType required" });

    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const products = cart.items.map((item) => ({
      product: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image || "",
    }));

    const totalAmount = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 7);

    const newOrder = new Order({
      user: req.user._id,
      products,
      totalAmount,
      address,
      paymentType,
      upiId: paymentType === "gpay" ? upiId : "",
      status: "Processing",
      expectedDelivery,
    });

    const savedOrder = await newOrder.save();
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

    res.status(201).json({
      message: "Order placed successfully",
      orderId: savedOrder._id,
      order: savedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

router.get("/orders/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
