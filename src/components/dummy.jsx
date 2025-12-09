// src/components/ProductCard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  useTheme,
} from "@mui/material";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

const getDiscountPercentage = (price, discount) => discount; // assuming discount % is provided

const ProductCard = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <Typography align="center" variant="h5">Loading...</Typography>;
  if (error)
    return (
      <Typography align="center" variant="h5" color="error">
        {error}
      </Typography>
    );

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 6, bgcolor: "#f4f4f4", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        Products
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {products.map((product) => (
          <Grid item key={product.product_id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px) scale(1.02)",
                  boxShadow: theme.shadows[8],
                },
                bgcolor: "#fff",
              }}
            >
              <CardMedia
                component="img"
                image={product.image_url}
                alt={product.name}
                sx={{
                  height: 180,
                  objectFit: "contain",
                  mb: 2,
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />

              <CardContent sx={{ p: 0, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                  {product.name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body1" fontWeight="bold" color="green">
                    {formatPrice(product.price - (product.price * product.discount) / 100)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: "line-through", color: "gray" }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                  <Chip label={`${product.discount}% off`} size="small" color="success" />
                </Box>

                <Typography
                  variant="body2"
                  color={product.stock > 0 ? "green" : "error"}
                  sx={{ mt: 1 }}
                >
                  {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1, fontSize: "0.9em" }}>
                  {product.description}
                </Typography>
              </CardContent>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "#FFD700",
                  color: "#000",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "black", color: "yellow" },
                  borderRadius: 2,
                  py: 1,
                }}
              >
                Add to Cart
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductCard;
