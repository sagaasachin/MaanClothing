// src/components/ProductCardPage.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Button,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL;

const ProductCardPage = () => {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch products
  useEffect(() => {
    axios
      .get(`${API_BASE}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  // Fetch wishlist
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setWishlistIds(res.data?.products?.map((p) => p._id) || [])
      )
      .catch((err) => {
        console.error("Failed to fetch wishlist:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again");
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [token, navigate]);

  // Wishlist toggle
  const handleToggleWishlist = async (productId) => {
    if (!token) {
      toast.info("Please login to continue");
      return navigate("/login");
    }

    const isFav = wishlistIds.includes(productId);

    try {
      if (isFav) {
        await axios.delete(`${API_BASE}/user/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        toast.info("Removed from Wishlist");
      } else {
        await axios.post(
          `${API_BASE}/user/wishlist`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds((prev) => [...prev, productId]);
        toast.success("Added to Wishlist");
      }
    } catch (err) {
      console.error("Wishlist update failed:", err);
      toast.error("Wishlist update failed");
    }
  };

  // Add to Cart
  const handleAddToCart = async (productId) => {
    if (!token) {
      toast.info("Please login to continue");
      return navigate("/login");
    }

    try {
      await axios.post(
        `${API_BASE}/user/cart`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to Cart");
    } catch (err) {
      console.error("Failed to add to Cart:", err);
      toast.error("Failed to add to Cart");
    }
  };

  const allCategories = [...new Set(products.map((p) => p.category))];

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts =
    selectedCategories.length === 0
      ? products
      : products.filter((p) => selectedCategories.includes(p.category));

  const toastStyles = {
    marginTop: "20px",
    width:
      windowWidth < 600 ? "220px" : windowWidth >= 1200 ? "500px" : "350px",
    fontSize: windowWidth < 600 ? "12px" : "14px",
    textAlign: "center",
    margin: "20px auto",
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 4 }, py: 6, bgcolor: "#f4f4f4" }}>

      <Typography
        variant="h4"
        textAlign="center"
        fontWeight="bold"
        mb={4}
        color="#333"
        sx={{
          fontSize: { xs: "18px", sm: "26px", md: "30px" },
          pt: { xs: 6, sm: 0 },
        }}
      >
        🛍 Explore Our Products
      </Typography>

      {/* Category Filter */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          boxShadow: 3,
          borderRadius: 2,
          mb: 5,
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
        }}
      >
        <FormGroup
          row
          sx={{
            justifyContent: "center",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 3, md: 5 },
          }}
        >
          {allCategories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  sx={{
                    transform: { xs: "scale(0.8)", sm: "scale(1)" },
                    "&.Mui-checked": { color: "#FFD700" },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: selectedCategories.includes(category)
                      ? "#000"
                      : "#555",
                    fontSize: { xs: "11px", sm: "14px" },
                  }}
                >
                  {category}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>

      {/* Product Cards */}
      <Grid
        container
        justifyContent="center"
        rowGap={{ xs: "8px", sm: "12px", md: "40px" }}
        columnGap={{ xs: "8px", sm: "12px", md: "60px" }}
      >
        {filteredProducts.map((product) => {
          const isFav = wishlistIds.includes(product._id);
          return (
            <Grid
              item
              key={product._id}
              xs={6}
              sm={4}
              md={3}
              lg={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                sx={{
                  width: { xs: 170, sm: 260, md: 300 },
                  height: { xs: 270, sm: 380, md: 400 },
                  borderRadius: 3,
                  boxShadow: 4,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
                }}
              >
                {/* Wishlist button */}
                <Tooltip
                  title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <IconButton
                    onClick={() => handleToggleWishlist(product._id)}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      color: isFav ? "red" : "grey",
                      zIndex: 2,
                    }}
                  >
                    {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>

                {/* Product Image */}
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 140, sm: 200, md: 250 },
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.image_url || "/placeholder.jpg"}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  />
                </Box>

                {/* Text */}
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "12px", sm: "14px", md: "16px" } }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="green"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "12px", sm: "14px", md: "15px" } }}
                  >
                    ₹{product.price}
                  </Typography>
                </CardContent>

                {/* Add to Cart */}
                <Button
                  onClick={() => handleAddToCart(product._id)}
                  variant="contained"
                  fullWidth
                  sx={{
                    mx: "auto",
                    mb: 1,
                    mt: 0,
                    width: { xs: "90%", sm: "85%", md: "80%" },
                    bgcolor: "#FFD700",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: { xs: "10px", sm: "12px", md: "14px" },
                    display: "flex",
                    justifyContent: "center",
                    "&:hover": { bgcolor: "#000", color: "#FFD700" },
                  }}
                >
                  <AddShoppingCartIcon
                    sx={{
                      mr: 1,
                      fontSize: { xs: "14px", sm: "16px", md: "18px" },
                    }}
                  />
                  Add to Cart
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ProductCardPage;
