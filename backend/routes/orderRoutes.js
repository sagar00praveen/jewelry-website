const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .post(orderController.createOrder)
  .get(
    authController.restrictTo('admin'),
    orderController.getOrders
  );

router.get('/myorders', orderController.getMyOrders);

router
  .route('/:id')
  .get(orderController.getOrderById);

router
  .route('/:id/pay')
  .put(orderController.updateOrderToPaid);

router
  .route('/:id/deliver')
  .put(
    authController.restrictTo('admin'),
    orderController.updateOrderToDelivered
  );

module.exports = router;