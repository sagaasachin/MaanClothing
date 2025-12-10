// frontend/src/pages/CartPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
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

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "react-toastify/dist/ReactToastify.css";

const API = import.meta.env.VITE_API_URL;

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

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/user/cart`, {
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
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH PROFILE ----------------
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const addresses = Array.isArray(res.data.address)
        ? res.data.address
        : res.data.address
        ? [res.data.address]
        : [];

      setAddressList(addresses);

      if (addresses.length > 0 && !selectedAddress) {
        setSelectedAddress(addresses[0]);
      }
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      toast.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  // ---------------- UPDATE QUANTITY ----------------
  const updateQuantity = async (productId, quantity) => {
    setCartItems((prev) =>
      prev.map((it) => (it.product_id === productId ? { ...it, quantity } : it))
    );

    try {
      setSavingQtyFor(productId);
      await axios.put(
        `${API}/user/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("updateQuantity error:", err);
      toast.error("Failed to update quantity — reverting");
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
    } else {
      toast.info("Max stock reached");
    }
  };

  const decreaseQty = (i) => {
    const updated = [...cartItems];
    if (updated[i].quantity > 1) {
      updated[i].quantity--;
      setCartItems(updated);
      updateQuantity(updated[i].product_id, updated[i].quantity);
    }
  };

  // ---------------- REMOVE ITEM ----------------
  const removeItem = async (productId) => {
    const original = [...cartItems];

    setCartItems((prev) => prev.filter((it) => it.product_id !== productId));

    try {
      setRemovingFor(productId);
      await axios.delete(`${API}/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Removed from cart");
    } catch (err) {
      console.error("removeItem error:", err);
      toast.error("Failed to remove item — reverting");
      setCartItems(original);
    } finally {
      setRemovingFor(null);
    }
  };

  // ---------------- NEXT STEP ----------------
  const handleNextStep = () => {
    if (step === 0 && cartItems.length === 0) return toast.warn("Cart empty!");
    if (step === 1 && !selectedAddress) return toast.warn("Select address!");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  // ---------------- CONFIRM ORDER ----------------
  const handleConfirmOrder = async () => {
    if (!paymentType) return toast.warn("Select payment method!");
    if ((paymentType === "gpay" || paymentType === "paytm") && !upiId)
      return toast.warn("Enter UPI ID!");

    try {
      await axios.post(
        `${API}/user/orders`,
        { address: selectedAddress, paymentType, upiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderPlaced(true);
      setCartItems([]);
      setStep(0);
      toast.success("Order placed!");
    } catch (err) {
      console.error("handleConfirmOrder error:", err);
      toast.error("Failed to confirm order");
    }
  };

  // ---------------- ADD ADDRESS ----------------
  const handleAddAddress = async () => {
    if (!newAddress.trim()) return toast.warn("Enter address");

    const updated = [...addressList, newAddress];

    setAddingAddressLoading(true);

    try {
      setAddressList(updated);
      setSelectedAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress("");

      await axios.put(
        `${API}/user/profile`,
        { address: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Address added");
    } catch (err) {
      console.error("handleAddAddress error:", err);
      toast.error("Failed to add address — reverting");
      await fetchUserProfile();
    } finally {
      setAddingAddressLoading(false);
    }
  };

  const placeholderImage = "https://via.placeholder.com/400x300?text=No+Image";

  // ---------------- UI ----------------
  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }} ref={stepRef}>

      {/* Back Button */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "black" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="body1"
          sx={{ cursor: "pointer", color: "#000000ff", fontWeight: "bold" }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Typography>
      </Box>

      {/* SUCCESS MESSAGE */}
      {orderPlaced && (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            🎉 Order Placed Successfully!
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Explore More
          </Button>
        </Box>
      )}

      {!orderPlaced && (
        <>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            🛒 Checkout
          </Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label, idx) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={(props) =>
                    step > idx ? (
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

          {/* LOADING */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* STEP 0 — CART ITEMS */}
              {step === 0 && (
                <>
                  {cartItems.length === 0 ? (
                    <Box sx={{ textAlign: "center", mt: 6 }}>
                      <Typography variant="h6" mb={2}>
                        🛒 Your cart is empty
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
                      <Grid container spacing={2} justifyContent="center">
                        {cartItems.map((item, i) => (
                          <Grid
                            item
                            key={item.product_id}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <Card
                              sx={{
                                width: "100%",
                                borderRadius: 3,
                                boxShadow: 4,
                                position: "relative",
                                overflow: "hidden",
                                transition: "all 0.25s ease-in-out",
                                "&:hover": { transform: "translateY(-4px)" },
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  height: { xs: 200, sm: 220, md: 180 },
                                  position: "relative",
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  image={item.image_url || placeholderImage}
                                  alt={item.name}
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                {item.discount > 0 && (
                                  <Chip
                                    label={`${item.discount}% OFF`}
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      top: 8,
                                      left: 8,
                                      bgcolor: "rgba(255,215,0,0.95)",
                                      color: "black",
                                      fontWeight: "bold",
                                    }}
                                  />
                                )}
                              </Box>

                              <CardContent
                                sx={{ textAlign: "left", flexGrow: 1 }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="700"
                                  sx={{ fontSize: { xs: 14, sm: 15 } }}
                                >
                                  {item.name}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 1,
                                  }}
                                >
                                  <Typography variant="h6" fontWeight="bold">
                                    ₹{priceAfterDiscount(item).toFixed(2)}
                                  </Typography>
                                  {item.discount > 0 && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        textDecoration: "line-through",
                                        color: "gray",
                                      }}
                                    >
                                      ₹{Number(item.price).toFixed(2)}
                                    </Typography>
                                  )}
                                </Box>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  Stock: {item.stock}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                  }}
                                >
                                  <Tooltip title="Decrease">
                                    <span>
                                      <IconButton
                                        onClick={() => decreaseQty(i)}
                                        disabled={
                                          item.quantity <= 1 ||
                                          savingQtyFor === item.product_id
                                        }
                                      >
                                        <RemoveIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Typography sx={{ mx: 1 }}>
                                    {item.quantity}
                                  </Typography>

                                  <Tooltip title="Increase">
                                    <span>
                                      <IconButton
                                        onClick={() => increaseQty(i)}
                                        disabled={
                                          item.quantity >= item.stock ||
                                          savingQtyFor === item.product_id
                                        }
                                      >
                                        <AddIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  {savingQtyFor === item.product_id && (
                                    <CircularProgress
                                      size={20}
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Box>
                              </CardContent>

                              <CardActions
                                sx={{ justifyContent: "center", p: 2 }}
                              >
                                <Button
                                  variant="contained"
                                  startIcon={<DeleteIcon />}
                                  color="error"
                                  onClick={() => removeItem(item.product_id)}
                                  disabled={removingFor === item.product_id}
                                  sx={{ width: "90%" }}
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

                      {/* Order Summary */}
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          maxWidth: 760,
                          mx: "auto",
                          mt: 4,
                        }}
                      >
                        <Typography variant="h6" mb={2}>
                          📝 Order Summary
                        </Typography>

                        {cartItems.map((item) => (
                          <Box
                            key={item.product_id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 600 }}>
                                {item.name} × {item.quantity}
                              </Typography>
                              {item.discount > 0 && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
                                  {item.discount}% off applied
                                </Typography>
                              )}
                            </Box>

                            <Typography>
                              ₹
                              {(
                                priceAfterDiscount(item) * item.quantity
                              ).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}

                        <Divider sx={{ my: 1 }} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography>Subtotal</Typography>
                          <Typography>₹{subtotal.toFixed(2)}</Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography>Platform Fee</Typography>
                          <Typography>₹{platformFee}</Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography>Delivery</Typography>
                          <Typography>₹{deliveryCharges}</Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "bold",
                            alignItems: "center",
                          }}
                        >
                          <Typography>Total</Typography>
                          <Typography>₹{total.toFixed(2)}</Typography>
                        </Box>

                        <Box sx={{ textAlign: "right", mt: 2 }}>
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: "gold",
                              color: "black",
                              "&:hover": { bgcolor: "#ffca28" },
                            }}
                            onClick={handleNextStep}
                            disabled={cartItems.length === 0}
                          >
                            Next
                          </Button>
                        </Box>
                      </Paper>
                    </>
                  )}
                </>
              )}

              {/* STEP 1 — ADDRESS */}
              {step === 1 && (
                <Paper
                  sx={{ p: 3, borderRadius: 3, maxWidth: 760, mx: "auto" }}
                >
                  <Typography variant="h6" mb={2}>
                    🏠 Delivery Address
                  </Typography>

                  <RadioGroup
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  >
                    {addressList.map((addr, idx) => (
                      <Paper
                        key={idx}
                        sx={{
                          p: 1,
                          mb: 1,
                          border:
                            selectedAddress === addr
                              ? "2px solid #FFD700"
                              : "1px solid #ccc",
                          borderRadius: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedAddress(addr)}
                      >
                        <FormControlLabel
                          value={addr}
                          control={<Radio />}
                          label={addr}
                          sx={{ width: "100%" }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>

                  {/* ADD ADDRESS */}
                  {showAddAddress ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        mt: 2,
                        gap: 1,
                      }}
                    >
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Enter new address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={handleAddAddress}
                          disabled={addingAddressLoading}
                        >
                          {addingAddressLoading ? "Adding..." : "Add"}
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setShowAddAddress(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Button
                      sx={{ mt: 1 }}
                      onClick={() => setShowAddAddress(true)}
                    >
                      Add New Address
                    </Button>
                  )}

                  <Box sx={{ textAlign: "right", mt: 3 }}>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: "gold",
                        color: "black",
                        "&:hover": { bgcolor: "#ffca28" },
                      }}
                      onClick={handleNextStep}
                      disabled={!selectedAddress}
                    >
                      Next
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* STEP 2 — PAYMENT */}
              {step === 2 && (
                <Paper
                  sx={{ p: 3, borderRadius: 3, maxWidth: 760, mx: "auto" }}
                >
                  <Typography variant="h6" mb={2}>
                    💳 Payment
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
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label="Card (Not available)"
                      disabled
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
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                          }}
                        >
                          <QRCodeCanvas
                            value={`upi://pay?pa=${encodeURIComponent(
                              upiId
                            )}&pn=MANsClothing&am=${total.toFixed(2)}&cu=INR`}
                            size={200}
                          />
                        </Box>
                      )}
                    </>
                  )}

                  <Box sx={{ textAlign: "right", mt: 3 }}>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: "gold",
                        color: "black",
                        "&:hover": { bgcolor: "#ffca28" },
                      }}
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
        </>
      )}
    </Box>
  );
};

export default CartPage;
