const express = require('express');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('gameStats.scenariosCompleted', 'title category');

    res.json({
      stats: user.gameStats,
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile settings
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, firstName, lastName, language } = req.body;

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      ...(language && { 'preferences.language': language })
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { difficultyLevel, soundEnabled, timerEnabled, hints } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'preferences.difficultyLevel': difficultyLevel,
          'preferences.soundEnabled': soundEnabled,
          'preferences.timerEnabled': timerEnabled,
          'preferences.hints': hints
        }
      },
      { new: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard with top scores
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, sortBy = 'highScore' } = req.query;
    const GameSession = require('../models/GameSession');

    // Get top scores from GameSessions
    const topScores = await GameSession.aggregate([
      {
        $match: {
          isCompleted: true,
          'score.total': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$user',
          highScore: { $max: '$score.total' },
          totalGames: { $sum: 1 },
          averageScore: { $avg: '$score.total' },
          bestTime: { $min: '$completionTime' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          username: '$userInfo.username',
          highScore: 1,
          totalGames: 1,
          averageScore: { $round: ['$averageScore', 1] },
          bestTime: 1
        }
      },
      {
        $sort: sortBy === 'avgScore' 
          ? { averageScore: -1 } 
          : sortBy === 'totalGames'
          ? { totalGames: -1, highScore: -1 }
          : { highScore: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Add rank to each entry
    const leaderboard = topScores.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json({ 
      leaderboard,
      sortBy 
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;