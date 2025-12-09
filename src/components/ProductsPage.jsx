// src/components/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductsPage = ({
  cart = [],
  wishlist = [],
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data); // ✅ backend should send an array of products
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please check backend connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading products...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  if (products.length === 0)
    return <p className="text-center mt-10">No products found.</p>;

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          inCart={cart.some((item) => item._id === product._id)}
          inWishlist={wishlist.some((item) => item._id === product._id)}
          onAddToCart={() => onAddToCart(product)}
          onAddToWishlist={() => onAddToWishlist(product)}
          onRemoveFromWishlist={() => onRemoveFromWishlist(product)}
        />
      ))}
    </div>
  );
};

export default ProductsPage;
