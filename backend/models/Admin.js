const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  adminKey: {
    type: String,
    required: [true, 'Admin key is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid 12-digit admin key!`
    },
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password and admin key before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password') && !this.isModified('adminKey')) return next();
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  if (this.isModified('adminKey')) {
    this.adminKey = await bcrypt.hash(this.adminKey, 12);
  }
  
  next();
});

// Method to check password
adminSchema.methods.correctPassword = async function(candidatePassword, adminPassword) {
  return await bcrypt.compare(candidatePassword, adminPassword);
};

// Method to check admin key
adminSchema.methods.correctAdminKey = async function(candidateKey, adminKey) {
  return await bcrypt.compare(candidateKey, adminKey);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;