// App.jsx
import React, { useState, useContext, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import NavbarPage from "./components/NavbarPage";
import LandingPage from "./components/LandingPage";
import ProductCardPage from "./components/ProductCard";
import WishlistPage from "./components/WishlistPage";
import CartPage from "./components/CartPage";
import OrdersPage from "./components/OrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./components/ProfilePage";
import FooterPage from "./components/FooterPage";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    if (user && redirectPath) {
      navigate(redirectPath);
      localStorage.removeItem("redirectAfterLogin");
    }
  }, [user, navigate]);

  const requireLogin = (action) => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", location.pathname);
      toast.warn(
        `Please login to ${
          action === "cart" ? "add items to cart" : "use wishlist"
        }`,
        {
          style: {
            fontSize: "11px",
            minWidth: "150px",
            padding: "6px",
          },
        }
      );
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = (product) => {
    if (!requireLogin("cart")) return;
    setCart((prev) => {
      if (prev.find((item) => item._id === product._id)) {
        toast.info("Item already in cart", {
          style: { fontSize: "11px", minWidth: "150px" },
        });
        return prev;
      }
      toast.success("Item added to cart!", {
        style: { fontSize: "11px", minWidth: "150px" },
      });
      return [...prev, product];
    });
  };

  const handleAddToWishlist = (product) => {
    if (!requireLogin("wishlist")) return;
    setWishlist((prev) => {
      if (prev.find((item) => item._id === product._id)) {
        toast.info("Item already in wishlist", {
          style: { fontSize: "11px", minWidth: "150px" },
        });
        return prev;
      }
      toast.success("Item added to wishlist!", {
        style: { fontSize: "11px", minWidth: "150px" },
      });
      return [...prev, product];
    });
  };

  const handleRemoveFromWishlist = (product) => {
    setWishlist((prev) => prev.filter((item) => item._id !== product._id));
    toast.info("Removed from wishlist", {
      style: { fontSize: "11px", minWidth: "150px" },
    });
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
      }}
    >
      <NavbarPage cart={cart} wishlist={wishlist} user={user} />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <LandingPage />
              <ProductCardPage
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            </>
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
            />
          }
        />
        <Route path="/cart" element={<CartPage cart={cart} />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      <FooterPage />

      {/* GLOBAL RESPONSIVE SMALL TOAST */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        toastStyle={{
          fontSize: "11px",
          minWidth: "150px",
          padding: "6px 8px",
          textAlign: "center",
        }}
      />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
