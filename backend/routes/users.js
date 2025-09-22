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
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const users = await User.find()
      .select('username gameStats.totalGamesPlayed gameStats.averageCompletionTime gameStats.bestCompletionTime')
      .sort({ 'gameStats.totalGamesPlayed': -1, 'gameStats.bestCompletionTime': 1 })
      .limit(parseInt(limit));

    res.json({ leaderboard: users });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;