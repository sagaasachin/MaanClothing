import Product from '../models/Product.js ' ;

export const getProducts = async (req, res) => {
  const { category, search } = req.query;
  let filter = {};
  if (category && category !== 'All') filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  try {
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
