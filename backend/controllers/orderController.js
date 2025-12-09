import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

export const placeOrder = async (req, res) => {
  const { address, paymentType, upiId } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    "items.productId"
  );
  if (!cart || cart.items.length === 0)
    return res.status(400).json({ message: "Cart empty" });

  const products = cart.items.map((item) => ({
    product: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    quantity: item.quantity,
  }));

  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const newOrder = new Order({
    user: req.user._id,
    products,
    totalAmount,
    address,
    paymentType,
    upiId: paymentType === "gpay" ? upiId : "",
    status: "Processing",
  });
  await newOrder.save();
  await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
  res.status(201).json({ message: "Order placed", orderId: newOrder._id });
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("products.product", "name price image")
    .sort({ createdAt: -1 });
  res.json({ orders });
};
