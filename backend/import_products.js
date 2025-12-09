import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Product from "./models/products.js";

// MongoDB Atlas URI
const MONGO_URI = "mongodb+srv://kumarkhan2808_db_user:54hQoCzvU8xvaR6F@ecom.t7kdgby.mongodb.net/ecommerceDB?retryWrites=true&w=majority";

// Read products.json
const __dirname = path.resolve();
const dataPath = path.join(__dirname, "data", "products.json");
const products = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function importProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    for (const prod of products) {
      await Product.findOneAndUpdate(
        { product_id: prod.product_id },  // find by product_id
        { $set: prod },                   // wrap object inside $set
        { upsert: true, new: true }       // create if not exists
      );
      console.log(`Updated/Inserted: ${prod.product_id} - ${prod.name}`);
    }

    console.log("🎉 All products imported/updated successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

importProducts();
