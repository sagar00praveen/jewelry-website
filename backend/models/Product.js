const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
    min: [0, 'Price must be a positive number']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: [true, 'A product must have an image']
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'A product must belong to a category'],
    enum: {
      values: ['rings', 'necklaces', 'earrings', 'bracelets', 'watches'],
      message: 'Category is either: rings, necklaces, earrings, bracelets, or watches'
    }
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 4.5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;