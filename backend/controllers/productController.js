const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get all products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Product.find(JSON.parse(queryStr));

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numProducts = await Product.countDocuments();
    if (skip >= numProducts) throw new Error('This page does not exist');
  }

  const products = await query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Get single product
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Create product (Admin only)
exports.createProduct = catchAsync(async (req, res, next) => {
  if (req.file) {
    // The path stored in DB should be relative to how frontend imports it. 
    // Usually via import or public URL. 
    // Since we save to src/assets, frontend normally imports these. 
    // However, dynamic imports are hard for user content.
    // Assuming the setup allows dynamic requiring or just referencing referencing filename if they are moved to public eventually.
    // For now, let's store the filename.
    // A better approach for React Vite is usually `/src/assets/${req.file.filename}` or similar if we use dynamic import.
    // BUT, user asked to save to frontend assets.
    // Let's store the relative path.
    req.body.image = `/src/assets/${req.file.filename}`;
  }
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

// Update product (Admin only)
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Delete product (Admin only)
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});