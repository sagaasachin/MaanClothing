// src/components/ProductList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductList = ({ selectedCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts =
    selectedCategory && selectedCategory !== "All"
      ? products.filter(
          (p) =>
            (p.category || "").toLowerCase() ===
            (selectedCategory || "").toLowerCase()
        )
      : products;

  if (loading) return <p>Loading products...</p>;

  return (
    <ProductCard
      products={filteredProducts}
      cart={[]} // You can replace with your actual cart state
      wishlist={[]} // Replace with actual wishlist state
      onAddToCart={(id) => console.log("Add to cart:", id)}
      onAddToWishlist={(id) => console.log("Add to wishlist:", id)}
      onRemoveFromWishlist={(id) => console.log("Remove from wishlist:", id)}
    />
  );
};

export default ProductList;
