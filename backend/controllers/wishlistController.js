import User from "../models/User.js";
import Product from "../models/Product.js ";

// GET WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("wishlist.productId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.wishlist.map((item) => ({
      _id: item.productId._id,
      title: item.productId.title,
      image: item.productId.image,
      description: item.productId.description,
    })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
};

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product)
      return res.status(404).json({ message: "User or Product not found" });

    const exists = user.wishlist.find(
      (item) => item.productId.toString() === productId
    );

    if (exists) {
      // Remove if already added (toggle behavior)
      user.wishlist = user.wishlist.filter(
        (item) => item.productId.toString() !== productId
      );
      await user.save();
      return res.json({ message: "Removed from wishlist" });
    } else {
      user.wishlist.push({ productId });
      await user.save();
      return res.json({ message: "Added to wishlist" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: { productId } },
    });
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error });
  }
};
