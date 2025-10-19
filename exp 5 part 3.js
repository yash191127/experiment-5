const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  products: [productSchema]
});

const Category = mongoose.model('Category', categorySchema);

app.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/categories/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/categories/:id/products', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    category.products.push(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/categories/:catId/products/:prodId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.catId);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const product = category.products.id(req.params.prodId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    Object.assign(product, req.body);
    const saved = await category.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/categories/:catId/products/:prodId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.catId);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const product = category.products.id(req.params.prodId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.remove();
    const saved = await category.save();
    res.json({ message: 'Product removed', category: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
