// frontend/src/pages/CartPage.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/api"; // ✅ Use shared axios instance
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Paper,
  Divider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "react-toastify/dist/ReactToastify.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(0);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [upiId, setUpiId] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingQtyFor, setSavingQtyFor] = useState(null);
  const [removingFor, setRemovingFor] = useState(null);
  const [addingAddressLoading, setAddingAddressLoading] = useState(false);

  const navigate = useNavigate();
  const stepRef = useRef(null);
  const token = localStorage.getItem("token");

  const platformFee = 50;
  const deliveryCharges = 40;
  const steps = ["Order Summary", "Delivery Address", "Payment"];

  const priceAfterDiscount = (item) =>
    Number((item.price * (1 - (item.discount || 0) / 100)).toFixed(2));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + priceAfterDiscount(item) * item.quantity,
    0
  );
  const total = subtotal + platformFee + deliveryCharges;

  // -------------------- FETCH CART --------------------
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await API.get("/user/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data.items || [];
      setCartItems(
        items.map((item) => ({
          product_id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          discount: item.productId.discount || 0,
          stock: item.productId.stock ?? item.productId.quantity ?? 0,
          image_url: item.productId.image_url,
          quantity: item.quantity || 1,
        }))
      );
    } catch (err) {
      console.error("fetchCart error:", err);
      toast.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- FETCH PROFILE --------------------
  const fetchUserProfile = async () => {
    try {
      const res = await API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const addresses = Array.isArray(res.data.address)
        ? res.data.address
        : res.data.address
        ? [res.data.address]
        : [];

      setAddressList(addresses);

      if (addresses.length > 0 && !selectedAddress)
        setSelectedAddress(addresses[0]);
    } catch (err) {
      console.error("fetchUserProfile error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  // -------------------- UPDATE QUANTITY --------------------
  const updateQuantity = async (productId, quantity) => {
    setCartItems((prev) =>
      prev.map((it) => (it.product_id === productId ? { ...it, quantity } : it))
    );

    try {
      setSavingQtyFor(productId);

      await API.put(
        `/user/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("updateQuantity error:", err);
      toast.error("Failed to update quantity");
      await fetchCart();
    } finally {
      setSavingQtyFor(null);
    }
  };

  const increaseQty = (i) => {
    const updated = [...cartItems];
    if (updated[i].quantity < updated[i].stock) {
      updated[i].quantity++;
      setCartItems(updated);
      updateQuantity(updated[i].product_id, updated[i].quantity);
    } else toast.info("Max stock reached");
  };

  const decreaseQty = (i) => {
    const updated = [...cartItems];
    if (updated[i].quantity > 1) {
      updated[i].quantity--;
      setCartItems(updated);
      updateQuantity(updated[i].product_id, updated[i].quantity);
    }
  };

  // -------------------- REMOVE ITEM --------------------
  const removeItem = async (productId) => {
    const original = [...cartItems];
    setCartItems((prev) => prev.filter((it) => it.product_id !== productId));

    try {
      setRemovingFor(productId);

      await API.delete(`/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 Trigger navbar refresh
      localStorage.setItem("refreshNavbar", Date.now());
    } catch (err) {
      console.error("removeItem error:", err);
      toast.error("Failed to remove item");
      setCartItems(original);
    } finally {
      setRemovingFor(null);
    }
  };

  // -------------------- ORDER FLOW --------------------
  const handleNextStep = () => {
    if (step === 0 && cartItems.length === 0)
      return toast.warn("Cart is empty!");

    if (step === 1 && !selectedAddress)
      return toast.warn("Please select an address!");

    setStep((s) => s + 1);
  };

  const handleConfirmOrder = async () => {
    if (!paymentType) return toast.warn("Select a payment method!");
    if ((paymentType === "gpay" || paymentType === "paytm") && !upiId)
      return toast.warn("Enter UPI ID!");

    try {
      await API.post(
        "/user/orders",
        {
          address: selectedAddress,
          paymentType,
          upiId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderPlaced(true);
      setCartItems([]);
      setStep(0);

      // 🔥 Navbar refresh
      localStorage.setItem("refreshNavbar", Date.now());

      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Failed to place order");
    }
  };

  // -------------------- ADD NEW ADDRESS --------------------
  const handleAddAddress = async () => {
    if (!newAddress.trim()) return toast.warn("Enter address");

    const updated = [...addressList, newAddress];
    setAddingAddressLoading(true);

    try {
      setAddressList(updated);
      setSelectedAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress("");

      await API.put(
        "/user/profile",
        { address: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Address added");
    } catch (err) {
      console.error("addAddress error:", err);
      toast.error("Failed to add address");
      fetchUserProfile();
    } finally {
      setAddingAddressLoading(false);
    }
  };

  // -------------------- UI --------------------
  const placeholderImage = "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }} ref={stepRef}>
      <ToastContainer position="top-center" autoClose={1500} />

      {/* BACK BUTTON */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton sx={{ color: "black" }} onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Typography>
      </Box>

      {/* ORDER PLACED UI */}
      {orderPlaced ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h4" fontWeight="bold">
            🎉 Order Placed Successfully!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          {/* HEADER */}
          <Typography variant="h4" fontWeight="bold" mb={2}>
            🛒 Checkout
          </Typography>

          {/* STEPPER */}
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={(props) =>
                    step > index ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      props.icon
                    )
                  }
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {/* ---------------- STEP 0: CART ITEMS ---------------- */}
          {step === 0 && (
            <>
              {loading ? (
                <Box sx={{ textAlign: "center", mt: 6 }}>
                  <CircularProgress />
                </Box>
              ) : cartItems.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 6 }}>
                  <Typography variant="h6" mb={2}>
                    Your cart is empty
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </Button>
                </Box>
              ) : (
                <>
                  {/* Cart Items */}
                  <Grid container spacing={2} justifyContent="center">
                    {cartItems.map((item, i) => (
                      <Grid
                        item
                        key={item.product_id}
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                      >
                        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                          <CardMedia
                            component="img"
                            image={item.image_url || placeholderImage}
                            sx={{ height: 220, objectFit: "cover" }}
                          />

                          <CardContent>
                            <Typography fontWeight="bold">
                              {item.name}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              <Typography fontWeight="bold">
                                ₹{priceAfterDiscount(item)}
                              </Typography>
                              {item.discount > 0 && (
                                <Typography
                                  sx={{
                                    textDecoration: "line-through",
                                    color: "gray",
                                  }}
                                >
                                  ₹{item.price}
                                </Typography>
                              )}
                            </Box>

                            <Typography color="text.secondary">
                              Stock: {item.stock}
                            </Typography>

                            {/* Qty Control */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <IconButton
                                onClick={() => decreaseQty(i)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon />
                              </IconButton>

                              <Typography sx={{ mx: 1 }}>
                                {item.quantity}
                              </Typography>

                              <IconButton
                                onClick={() => increaseQty(i)}
                                disabled={item.quantity >= item.stock}
                              >
                                <AddIcon />
                              </IconButton>

                              {savingQtyFor === item.product_id && (
                                <CircularProgress size={18} sx={{ ml: 1 }} />
                              )}
                            </Box>
                          </CardContent>

                          <CardActions sx={{ justifyContent: "center" }}>
                            <Button
                              color="error"
                              variant="contained"
                              startIcon={<DeleteIcon />}
                              onClick={() => removeItem(item.product_id)}
                              disabled={removingFor === item.product_id}
                            >
                              {removingFor === item.product_id
                                ? "Removing..."
                                : "Remove"}
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* ORDER SUMMARY */}
                  <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
                    <Typography variant="h6" mb={2}>
                      Order Summary
                    </Typography>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography>Subtotal</Typography>
                      <Typography>₹{subtotal.toFixed(2)}</Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography>Platform Fee</Typography>
                      <Typography>₹{platformFee}</Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography>Delivery</Typography>
                      <Typography>₹{deliveryCharges}</Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography fontWeight="bold">Total</Typography>
                      <Typography fontWeight="bold">
                        ₹{total.toFixed(2)}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      sx={{
                        mt: 3,
                        bgcolor: "gold",
                        color: "black",
                      }}
                      onClick={handleNextStep}
                    >
                      Next
                    </Button>
                  </Paper>
                </>
              )}
            </>
          )}

          {/* ---------------- STEP 1: ADDRESS ---------------- */}
          {step === 1 && (
            <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 750, mx: "auto" }}>
              <Typography variant="h6" mb={2}>
                Delivery Address
              </Typography>

              <RadioGroup
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                {addressList.map((addr, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      border:
                        addr === selectedAddress
                          ? "2px solid gold"
                          : "1px solid #ccc",
                      borderRadius: 2,
                    }}
                  >
                    <FormControlLabel
                      value={addr}
                      control={<Radio />}
                      label={addr}
                    />
                  </Paper>
                ))}
              </RadioGroup>

              {showAddAddress ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter new address"
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={addingAddressLoading}
                    onClick={handleAddAddress}
                  >
                    {addingAddressLoading ? "Adding..." : "Add Address"}
                  </Button>
                  <Button
                    sx={{ mt: 1 }}
                    onClick={() => setShowAddAddress(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button sx={{ mt: 1 }} onClick={() => setShowAddAddress(true)}>
                  Add New Address
                </Button>
              )}

              <Box sx={{ textAlign: "right", mt: 3 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "gold", color: "black" }}
                  onClick={handleNextStep}
                  disabled={!selectedAddress}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          )}

          {/* ---------------- STEP 2: PAYMENT ---------------- */}
          {step === 2 && (
            <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 750, mx: "auto" }}>
              <Typography variant="h6" mb={2}>
                Payment
              </Typography>

              <RadioGroup
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label="Cash on Delivery"
                />
                <FormControlLabel
                  value="gpay"
                  control={<Radio />}
                  label="Google Pay"
                />
                <FormControlLabel
                  value="paytm"
                  control={<Radio />}
                  label="Paytm"
                />
              </RadioGroup>

              {(paymentType === "gpay" || paymentType === "paytm") && (
                <>
                  <TextField
                    fullWidth
                    sx={{ mt: 2 }}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID"
                  />

                  {upiId && (
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <QRCodeCanvas
                        value={`upi://pay?pa=${upiId}&pn=MANsClothing&am=${total}&cu=INR`}
                        size={200}
                      />
                    </Box>
                  )}
                </>
              )}

              <Box sx={{ textAlign: "right", mt: 3 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "gold", color: "black" }}
                  onClick={handleConfirmOrder}
                  disabled={paymentType === ""}
                >
                  Place Order
                </Button>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default CartPage;
