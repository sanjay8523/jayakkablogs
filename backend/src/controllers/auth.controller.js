const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase.config');
const { generateToken } = require('../utils/jwt.utils');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name.'
      });
    }

    // Check if user already exists
    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();

    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    const userDoc = await usersRef.add(newUser);

    // Generate JWT token
    const token = generateToken(userDoc.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: userDoc.id,
        email,
        name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Get user data
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check password
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = generateToken(userDoc.id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message
    });
  }
};

// Get current user (protected route)
const getMe = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data.',
      error: error.message
    });
  }
};

module.exports = { register, login, getMe };