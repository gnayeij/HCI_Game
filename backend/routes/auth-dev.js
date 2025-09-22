const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// In-memory user storage for development (replace with database in production)
const users = new Map();

// Helper function to create user object
const createUser = (userData) => {
  const now = new Date();
  return {
    _id: Date.now().toString(),
    username: userData.username,
    email: userData.email,
    password: userData.password, // Already hashed
    role: 'user',
    profile: {
      firstName: userData.firstName || '',
      lastName: userData.lastName || ''
    },
    gameStats: {
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      averageCompletionTime: 0,
      bestCompletionTime: null,
      scenariosCompleted: [],
      currentLevel: 1
    },
    preferences: {
      difficultyLevel: 'medium',
      soundEnabled: true,
      timerEnabled: true,
      hints: true
    },
    createdAt: now,
    updatedAt: now
  };
};

// @route   POST /api/auth-dev/register
// @desc    Register a new user (development mode)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide username, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    for (const [key, user] of users) {
      if (user.email === email || user.username === username) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName
    };

    const user = createUser(userData);
    const userId = user._id;
    
    // Store user
    users.set(userId, user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId }, 
      process.env.JWT_SECRET || 'default-secret', 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });

    console.log(`✅ User registered: ${username} (${email})`);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
});

// @route   POST /api/auth-dev/login
// @desc    Login user (development mode)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide username and password' 
      });
    }

    // Find user (username can be email or username)
    let foundUser = null;
    let userId = null;
    
    for (const [key, user] of users) {
      if (user.email === username || user.username === username) {
        foundUser = user;
        userId = key;
        break;
      }
    }

    if (!foundUser) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId }, 
      process.env.JWT_SECRET || 'default-secret', 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    const userResponse = { ...foundUser };
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

    console.log(`✅ User logged in: ${foundUser.username}`);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
});

// @route   GET /api/auth-dev/me
// @desc    Get current user (development mode)
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Get user from memory
    const user = users.get(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth-dev/users
// @desc    Get all users (development mode)
// @access  Public
router.get('/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json({ 
    users: userList,
    count: userList.length 
  });
});

module.exports = router;