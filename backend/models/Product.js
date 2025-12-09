// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number,
  description: String,
  image_url: String,
});

const Product = mongoose.model("Product", productSchema);

// ⚠️ Make sure to use default export if you want 'import Product from ...'
export default Product;
