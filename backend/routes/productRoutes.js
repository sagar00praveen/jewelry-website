const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes (admin only)
router.use(authController.protect, authController.restrictTo('admin'));

const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;