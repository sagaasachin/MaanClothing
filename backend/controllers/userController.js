import User from "../models/User.js";
import Product from "../models/Product.js";

// 👤 Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("wishlist")
      .populate("cart.product");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile", error });
  }
};

// ❤️ Get Wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error });
  }
};

// ❤️ Add to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to wishlist", error });
  }
};

// 💔 Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from wishlist", error });
  }
};

// 🛒 Get Cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart", error });
  }
};

// 🛒 Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const populatedUser = await User.findById(req.user.id).populate("cart.product");

    res.json({ message: "Added to cart", cart: populatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error });
  }
};

// 🗑️ Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    await user.save();

    res.json({ message: "Removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from cart", error });
  }
};
