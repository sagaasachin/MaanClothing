import React, { useState, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import NavbarPage from "./components/NavbarPage";
import ProductPage from "./components/ProductsPage";
import WishlistPage from "./components/WishlistPage";
import CartPage from "./components/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function AppContent() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Require login before action with better user feedback
  const requireLogin = (action, product = null) => {
    if (!user) {
      // Store current path for redirect after login
      localStorage.setItem("redirectAfterLogin", location.pathname);
      
      // Show action-specific message
      const actionMessages = {
        cart: "Please login to add items to your cart",
        wishlist: "Please login to add items to your wishlist"
      };
      
      if (actionMessages[action]) {
        alert(actionMessages[action]);
      }
      
      navigate("/login");
      return false;
    }
    return true;
  };

  // 🛒 Add to cart
  const handleAddToCart = (product) => {
    if (!requireLogin("cart", product)) return;
    
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        alert("Item is already in your cart!");
        return prev;
      }
      alert("Item added to cart successfully!");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // 💖 Add to wishlist
  const handleAddToWishlist = (product) => {
    if (!requireLogin("wishlist", product)) return;
    
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        alert("Item is already in your wishlist!");
        return prev;
      }
      alert("Item added to wishlist successfully!");
      return [...prev, product];
    });
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
  };

  // Remove from cart
  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  // Update cart quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <div className="App">
      <NavbarPage cart={cart} wishlist={wishlist} user={user} />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProductPage
                cart={cart}
                wishlist={wishlist}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage
                  wishlist={wishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  onAddToCart={handleAddToCart}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage 
                  cart={cart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}