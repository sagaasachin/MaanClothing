// frontend/src/pages/WishlistPage.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const WishlistPage = () => {
  const { user } = useContext(AuthContext);

  const API = import.meta.env.VITE_API_URL;

  const [wishlist, setWishlist] = useState([]);
  const [internalAction, setInternalAction] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API}/user/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist(res.data.products || res.data.wishlist || []);
      } catch (err) {
        console.error("❌ Failed to fetch wishlist:", err);
      }
    };

    fetchWishlist();
  }, [API]);

  // ⭐ Remove From Wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/user/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      localStorage.setItem("refreshNavbar", Date.now());

      if (internalAction) {
        toast.info("💛 Removed from Wishlist", {
          position: "top-center",
          style: {
            fontSize: isMobile ? "10px" : "12px",
            minWidth: isMobile ? "140px" : "180px",
            padding: "6px",
          },
        });
      }
      setInternalAction(false);
    } catch (err) {
      console.error("❌ Failed to remove:", err);
      if (internalAction) {
        toast.error("❌ Could not remove", {
          position: "top-center",
          style: {
            fontSize: isMobile ? "10px" : "12px",
            minWidth: isMobile ? "140px" : "180px",
          },
        });
      }
      setInternalAction(false);
    }
  };

  // ⭐ Add To Cart
  const addToCart = async (productId) => {
    try {
      if (!user) {
        toast.warn("Please login to add to cart", {
          position: "top-center",
          style: { fontSize: "11px", minWidth: "160px" },
        });
        return navigate("/login");
      }

      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/user/cart`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("refreshNavbar", Date.now());

      toast.success("🛒 Added to cart", {
        position: "top-center",
        style: {
          fontSize: isMobile ? "10px" : "12px",
          minWidth: isMobile ? "140px" : "180px",
        },
      });
    } catch (err) {
      console.error("❌ Cart error:", err);
      toast.error("❌ Failed to add to cart", {
        position: "top-center",
        style: {
          fontSize: isMobile ? "10px" : "12px",
          minWidth: isMobile ? "140px" : "180px",
        },
      });
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4, md: 6 },
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* Back Button */}
      <Typography
        variant="body1"
        sx={{
          cursor: "pointer",
          color: "black",
          fontWeight: "bold",
          mb: 3,
          "&:hover": { color: "#FFD700", textDecoration: "underline" },
        }}
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </Typography>

      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{
          mb: 3,
          color: "black",
          "&:hover": { color: "#FFD700" },
        }}
      >
        My Wishlist
      </Typography>

      {/* Empty Case */}
      {wishlist.length === 0 ? (
        <Typography sx={{ color: "#555", fontSize: { xs: 16, sm: 18 } }}>
          No items in wishlist
        </Typography>
      ) : (
        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }}
          justifyContent="center"
        >
          {wishlist.map((item) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2.4}
              key={item._id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                sx={{
                  width: { xs: 150, sm: 220, md: 260, lg: 300 },
                  borderRadius: 3,
                  boxShadow: 4,
                  overflow: "hidden",
                  position: "relative",
                  transition: "0.3s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 8 },
                }}
              >
                <Tooltip title="Remove from Wishlist">
                  <IconButton
                    onClick={() => {
                      setInternalAction(true);
                      removeFromWishlist(item._id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "red",
                      zIndex: 2,
                    }}
                  >
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>

                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 130, sm: 160, md: 180, lg: 220 },
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.image_url || item.image || "/placeholder.jpg"}
                    alt={item.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "0.5s",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  />
                </Box>

                <CardContent sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "12px", sm: "14px", md: "15px" } }}
                  >
                    {item.name}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="green"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "11px", sm: "13px", md: "14px" } }}
                  >
                    ₹{item.price}
                  </Typography>
                </CardContent>
                <Button
                  variant="contained"
                  startIcon={
                    <ShoppingCartIcon
                      sx={{ fontSize: { xs: 14, sm: 18, md: 20 } }}
                    />
                  }
                  onClick={() => addToCart(item._id)}
                  sx={{
                    width: { xs: "90%", sm: "85%" },
                    mx: "auto",
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                    py: { xs: 0.6, sm: 0.9, md: 1.1 },
                    fontSize: { xs: "10px", sm: "12px", md: "14px" },
                    bgcolor: "#FFD700",
                    color: "#000",
                    fontWeight: "bold",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#000", color: "#FFD700" },
                  }}
                >
                  Add to Cart
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default WishlistPage;
