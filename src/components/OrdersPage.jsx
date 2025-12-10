// frontend/src/components/OrdersPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api"; // ✅ Uses global axios baseURL

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  Chip,
  Button,
  useMediaQuery,
} from "@mui/material";

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  // ⭐ Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await API.get("/user/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "warning";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#ffffff", minHeight: "100vh" }}>
      {/* Back Button */}
      <Button
        variant="text"
        sx={{
          mb: 3,
          color: "#000",
          fontWeight: "bold",
          "&:hover": { color: "#FFD700" },
        }}
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </Button>

      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ color: "#000", fontWeight: "bold" }}
      >
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography sx={{ color: "#000", mt: 4, textAlign: "center" }}>
          No previous orders found 😔
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {/* Order Info */}
                <CardContent sx={{ pb: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography sx={{ fontWeight: "bold", color: "#000" }}>
                      Order ID: {order._id.slice(0, 8)}...
                    </Typography>

                    <Chip
                      label={order.status}
                      size="small"
                      color={getStatusColor(order.status)}
                      sx={{
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    />
                  </Stack>

                  <Typography sx={{ color: "#000", fontSize: "0.9rem" }}>
                    Total: ₹{order.totalAmount}
                  </Typography>

                  <Typography sx={{ color: "#000", fontSize: "0.9rem" }}>
                    Payment: {order.paymentType}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#000",
                      fontSize: "0.85rem",
                    }}
                    noWrap
                  >
                    Address: {order.address}
                  </Typography>

                  <Typography sx={{ color: "#000", fontSize: "0.9rem" }}>
                    Delivery:{" "}
                    {new Date(order.expectedDelivery).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <Divider />

                {/* Product List */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    maxHeight: isMobile ? 200 : 250,
                    overflowY: "auto",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#FFD700",
                      mb: 1,
                      fontWeight: "bold",
                    }}
                  >
                    Products
                  </Typography>

                  <Stack spacing={1}>
                    {order.products.map((p) => (
                      <Box key={p.product}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: "#000",
                            fontSize: "0.9rem",
                          }}
                        >
                          {p.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "#000",
                          }}
                        >
                          {p.quantity} × ₹{p.price}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OrdersPage;
