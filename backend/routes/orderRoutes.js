import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/place-order", async (req, res) => {
  try {
    const { userId, orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json({ message: "Order placed successfully", order: createdOrder });
  } catch (error) {
    console.error("❌ Failed to place order:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
});

export default router;
