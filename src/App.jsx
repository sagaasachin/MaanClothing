// App.jsx
import React, { lazy, Suspense, useContext, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";

// 🚀 LAZY LOAD ALL BIG COMPONENTS (Boosts speed)
const NavbarPage = lazy(() => import("./components/NavbarPage"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const ProductCardPage = lazy(() => import("./components/ProductCard"));
const WishlistPage = lazy(() => import("./components/WishlistPage"));
const CartPage = lazy(() => import("./components/CartPage"));
const OrdersPage = lazy(() => import("./components/OrdersPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const FooterPage = lazy(() => import("./components/FooterPage"));

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ------------------------
// MAIN CONTENT
// ------------------------
function AppContent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Auto-redirect after login
  useEffect(() => {
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    if (user && redirectPath) {
      navigate(redirectPath);
      localStorage.removeItem("redirectAfterLogin");
    }
  }, [user, navigate]);

  // Protect pages
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

  return (
    <>
      {/* Lazy Suspense Wrapper */}
      <Suspense
        fallback={
          <div
            style={{
              width: "100%",
              textAlign: "center",
              marginTop: "60px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Loading...
          </div>
        }
      >
        <NavbarPage user={user} />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <LandingPage />
                <ProductCardPage />
              </>
            }
          />

          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>

        <FooterPage />
      </Suspense>

      {/* Global Toast (Responsive Small Size) */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        limit={2}
        toastStyle={{
          fontSize: "11px",
          padding: "6px 10px",
          minWidth: "150px",
          textAlign: "center",
        }}
      />
    </>
  );
}

// ------------------------
// EXPORT WRAPPED WITH AUTH PROVIDER
// ------------------------
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
