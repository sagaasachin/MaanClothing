// frontend/src/components/NavbarPage.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ✅ Use shared API (gets baseURL from VITE_API_URL)
import API from "../api/api";

import logo from "../assets/logo.png";

const NavbarPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // 🔥 Fetch Wishlist + Cart Counts using backend URL from .env
  const fetchCounts = async () => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      const [cartRes, wishRes] = await Promise.all([
        API.get("/user/cart", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/user/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCartCount(cartRes.data.items?.length || 0);
      setWishlistCount(wishRes.data.products?.length || 0);
    } catch (err) {
      console.error("❌ Error fetching counts:", err.message);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [user]);

  // 🔥 Real-time Navbar refresh using localStorage event
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "refreshNavbar") {
        fetchCounts();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "#0d0d0d", boxShadow: 3, px: { xs: 1, sm: 2 } }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo */}
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: { xs: 35, sm: 40 },
                height: { xs: 35, sm: 40 },
                mr: 1,
                borderRadius: 1,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "gold",
                fontSize: { xs: "1rem", sm: "1.3rem" },
              }}
            >
              MAN's Clothing
            </Typography>
          </Box>

          {/* Desktop Icons */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton color="inherit" onClick={() => navigate("/wishlist")}>
              <Badge badgeContent={wishlistCount} color="error">
                <FavoriteIcon sx={{ color: "#fff" }} />
              </Badge>
            </IconButton>

            <IconButton color="inherit" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon sx={{ color: "#fff" }} />
              </Badge>
            </IconButton>

            <IconButton color="inherit" onClick={handleProfileClick}>
              <AccountCircleIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>

          {/* Mobile Hamburger */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, color: "#fff" }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Profile Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{ sx: { mt: 1.5, minWidth: 200 } }}
          >
            {user ? (
              <>
                <MenuItem disabled>
                  <Typography variant="subtitle2">{user.name}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2">{user.email}</Typography>
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleClose();
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/orders");
                    handleClose();
                  }}
                >
                  Orders
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                    handleClose();
                  }}
                >
                  Logout
                </MenuItem>
              </>
            ) : (
              <MenuItem
                onClick={() => {
                  navigate("/login");
                  handleClose();
                }}
              >
                Login
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 1 }} />

          <List>
            <ListItem button onClick={() => navigate("/wishlist")}>
              <Badge badgeContent={wishlistCount} color="error" sx={{ mr: 2 }}>
                <FavoriteIcon />
              </Badge>
              <ListItemText primary="Wishlist" />
            </ListItem>

            <ListItem button onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error" sx={{ mr: 2 }}>
                <ShoppingCartIcon />
              </Badge>
              <ListItemText primary="Cart" />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {user ? (
              <>
                <ListItem button onClick={() => navigate("/profile")}>
                  <ListItemText primary="Profile" />
                </ListItem>

                <ListItem button onClick={() => navigate("/orders")}>
                  <ListItemText primary="Orders" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <ListItem button onClick={() => navigate("/login")}>
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavbarPage;
