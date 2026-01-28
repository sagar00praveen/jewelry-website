const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentResult
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return next(new AppError('No order items', 400));
  }

  // Check if products exist and update their stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Product not found: ${item.product}`, 404));
    }
    if (product.inStock === false) {
      return next(
        new AppError(`Product ${product.name} is out of stock`, 400)
      );
    }
  }

  const order = new Order({
    user: req.user._id,
    userEmail: req.user.email,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentResult
  });

  const createdOrder = await order.save();

  // Update product stock
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { countInStock: -item.qty } }
    );
  }

  res.status(201).json(createdOrder);
});

// Get order by ID
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Update order to paid
exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address
  };

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});

// Update order status (Admin)
exports.updateOrderToDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const { status, isPaid } = req.body;

  // Update Order Status
  if (status) {
    order.orderStatus = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      // If moved back from Delivered?
      if (order.isDelivered && status !== 'Delivered') {
        order.isDelivered = false;
        order.deliveredAt = undefined;
      }
    }
  }

  // Update Payment Status (Admin override)
  if (typeof isPaid !== 'undefined') {
    // CHECK: Can only update payment status if order is delivered OR is being set to Delivered now
    const isDeliveredNow = (status === 'Delivered') || order.isDelivered;

    if (!isDeliveredNow) {
      return next(new AppError('Payment status can only be updated for delivered orders', 400));
    }

    order.isPaid = isPaid;
    if (isPaid) {
      order.paidAt = order.paidAt || Date.now(); // Keep original date if already paid, else set now
    } else {
      order.paidAt = undefined;
      order.paymentResult = undefined; // Clear payment result if marked unpaid
    }
  }

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});

// Get logged in user orders
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Get all orders (Admin)
exports.getOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({}).populate('user', 'id name');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});