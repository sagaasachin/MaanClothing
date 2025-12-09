// frontend/src/components/OrdersPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:5000/api/user/orders/my-orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(res.data.orders);
      } catch (err) {
        console.error("❌ Error fetching orders:", err.message);
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
      {/* Back to Home */}
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
        &larr; Back to Home
      </Button>

      {/* Page Heading */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ color: "#000000ff", fontWeight: "bold" }}
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
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {/* Order Summary */}
                <CardContent sx={{ pb: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#000", fontWeight: "bold" }}
                    >
                      Order ID: {order._id.slice(0, 8)}...
                    </Typography>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      color: "#000000ff",
                      fontSize: isMobile ? "0.85rem" : "0.95rem",
                    }}
                  >
                    Total: ₹{order.totalAmount}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#000",
                      fontSize: isMobile ? "0.85rem" : "0.95rem",
                    }}
                  >
                    Payment: {order.paymentType}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#000",
                      fontSize: isMobile ? "0.85rem" : "0.95rem",
                    }}
                    noWrap
                  >
                    Address: {order.address}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#000",
                      fontSize: isMobile ? "0.85rem" : "0.95rem",
                    }}
                  >
                    Delivery:{" "}
                    {new Date(order.expectedDelivery).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <Divider sx={{ my: 1, borderColor: "#000000ff" }} />

                {/* Products List */}
                <CardContent
                  sx={{
                    pt: 1,
                    flexGrow: 1,
                    overflowY: "auto",
                    maxHeight: isMobile ? 200 : 250,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#FFD700", mb: 1, fontWeight: "bold" }}
                  >
                    Products
                  </Typography>
                  <Stack spacing={1}>
                    {order.products.map((p) => (
                      <Box key={p.product}>
                        <Typography
                          sx={{
                            color: "#000",
                            fontWeight: "bold",
                            fontSize: isMobile ? "0.85rem" : "0.95rem",
                          }}
                        >
                          {p.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#000000ff",
                            fontSize: isMobile ? "0.75rem" : "0.85rem",
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
