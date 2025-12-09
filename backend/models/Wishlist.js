import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

export default mongoose.model("Wishlist", WishlistSchema);
