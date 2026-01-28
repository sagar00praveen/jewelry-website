const User = require('../models/User');
const Admin = require('../models/Admin'); // ✅ You forgot this earlier
const jwt = require('jsonwebtoken');
const { signToken, createSendToken } = require('../utils/jwt');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


// =============================
// USER SIGNUP
// =============================
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password
  });

  createSendToken(newUser, 201, res);
});


// =============================
// USER LOGIN
// =============================
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, privateKey } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password +privateKey');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.role === 'admin') {
    if (!privateKey) {
      return next(new AppError('Admin login requires private key', 400));
    }
    if (user.privateKey !== privateKey) {
      return next(new AppError('Incorrect private key', 401));
    }
  }

  createSendToken(user, 200, res);
});


// =============================
// ADMIN LOGIN
// =============================
exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password, adminKey } = req.body;

  if (!email || !password || !adminKey) {
    return next(
      new AppError('Please provide email, password and admin key!', 400)
    );
  }

  // Make sure Admin model exists
  const admin = await Admin.findOne({ email }).select('+password +adminKey');

  if (!admin) {
    return next(new AppError('No admin found with that email', 404));
  }

  if (!(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  if (!(await admin.correctAdminKey(adminKey, admin.adminKey))) {
    return next(new AppError('Incorrect admin key', 401));
  }

  const token = signToken(admin._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    }
  });
});


// =============================
// PROTECT ROUTES
// =============================
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  req.user = currentUser;
  next();
});


// =============================
// RESTRICT TO SPECIFIC ROLES
// =============================
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// =============================
// GET CURRENT USER (Verify Token)
// =============================
exports.getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};
