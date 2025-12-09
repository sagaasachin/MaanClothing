// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    paymentType: {
      type: String,
      enum: ["cash", "gpay", "paytm", "card"],
      required: true,
    },
    upiId: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Processing",
    },
    expectedDelivery: { type: Date }, // ✅ Add this field
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
