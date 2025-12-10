// App.jsx
import React, { lazy, Suspense, useContext, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";

// 🚀 Lazy Loading for Better Performance
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

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// -------------------------------------------------------------------------
// MAIN APP CONTENT
// -------------------------------------------------------------------------
function AppContent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ Always Scroll to Top When Route Changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // ⭐ Redirect Back After Login
  useEffect(() => {
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    if (user && redirectPath) {
      navigate(redirectPath);
      localStorage.removeItem("redirectAfterLogin");
    }
  }, [user, navigate]);

  return (
    <>
      {/* Suspense Loader */}
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
        {/* Navigation */}
        <NavbarPage />

        {/* App Routes */}
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

        {/* Footer */}
        <FooterPage />
      </Suspense>

      {/* 🌟 Global Toast Notification (only one in entire app) */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        limit={2}
        closeOnClick
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        draggable={false}
        toastStyle={{
          width: "auto",
          maxWidth:
            window.innerWidth < 400
              ? "220px"
              : window.innerWidth < 768
              ? "260px"
              : "300px",
          fontSize:
            window.innerWidth < 400
              ? "11px"
              : window.innerWidth < 768
              ? "12px"
              : "13px",
          padding: "8px 12px",
          textAlign: "center",
          borderRadius: "6px",
        }}
      />
    </>
  );
}

// -------------------------------------------------------------------------
// EXPORT APP WITH AUTH PROVIDER
// -------------------------------------------------------------------------
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
