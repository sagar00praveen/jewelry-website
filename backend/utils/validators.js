// utils/validators.js
const { body } = require('express-validator');

exports.createProductRules = [
  body('name').notEmpty().withMessage('Name required'),
  body('price').isNumeric().withMessage('Price must be numeric'),
  body('imageId').notEmpty().withMessage('imageId required')
];
