import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  door: { type: String, required: true },
  street: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },

    // Store multiple detailed addresses
    addresses: [addressSchema],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
