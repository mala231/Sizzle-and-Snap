const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { USER_ROLES } = require('../constants');

const router = express.Router();

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, name, phone, password } = req.body;

  // Input validation
  if (!email || !name || !phone || !password) {
    return res.status(400).json({
      error: true,
      message: 'Email, name, phone, and password are required.'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid email format.'
    });
  }

  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({
      error: true,
      message: 'Password must be at least 6 characters long.'
    });
  }

  try {
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'Email is already registered.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone.trim(),
        passwordHash,
        role: USER_ROLES.CUSTOMER // Default is customer
      }
    });

    const token = generateToken(user);

    return res.status(201).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to register user. Please try again.'
    });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'Email and password are required.'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Invalid email or password.'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        error: true,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: true,
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// 3. POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Stateless JWT doesn't require server-side invalidation. Client discards the token.
  return res.status(200).json({
    data: {
      message: 'Logged out successfully.'
    }
  });
});

module.exports = router;
