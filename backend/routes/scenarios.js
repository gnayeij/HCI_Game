const express = require('express');
const Scenario = require('../models/Scenario');
const GameSession = require('../models/GameSession');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/scenarios
// @desc    Get all published scenarios
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    
    const filter = { 'metadata.isPublished': true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const scenarios = await Scenario.find(filter)
      .select('title description category difficulty estimatedDuration learningObjectives metadata.playCount metadata.averageRating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'metadata.playCount': -1 });

    const total = await Scenario.countDocuments(filter);

    res.json({
      scenarios,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scenarios/:id
// @desc    Get scenario by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findOne({
      _id: req.params.id,
      'metadata.isPublished': true
    });

    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    res.json({ scenario });

  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/scenarios/:id/start
// @desc    Start a new game session
// @access  Private
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const scenario = await Scenario.findOne({
      _id: req.params.id,
      'metadata.isPublished': true
    });

    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    // Check if user has an incomplete session for this scenario
    const existingSession = await GameSession.findOne({
      user: req.user._id,
      scenario: scenario._id,
      isCompleted: false
    });

    if (existingSession) {
      // Get current node for existing session
      const currentNode = scenario.nodes.find(node => node.id === existingSession.currentNodeId);
      
      return res.json({
        message: 'Existing session found',
        session: existingSession,
        currentNode: currentNode
      });
    }

    // Create new game session
    const gameSession = new GameSession({
      user: req.user._id,
      scenario: scenario._id,
      currentNodeId: scenario.startingNode
    });

    await gameSession.save();

    // Get starting node
    const startingNode = scenario.nodes.find(node => node.id === scenario.startingNode);

    res.json({
      message: 'Game session started',
      session: gameSession,
      currentNode: startingNode
    });

  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/scenarios/sessions/:sessionId/decision
// @desc    Make a decision in the game
// @access  Private
router.post('/sessions/:sessionId/decision', authMiddleware, async (req, res) => {
  try {
    const { decisionId, timeTaken } = req.body;

    const session = await GameSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
      isCompleted: false
    }).populate('scenario');

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    const scenario = session.scenario;
    const currentNode = scenario.nodes.find(node => node.id === session.currentNodeId);
    
    if (!currentNode) {
      return res.status(400).json({ message: 'Invalid game state' });
    }

    const decision = currentNode.decisions.find(d => d.id === decisionId);
    
    if (!decision) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    // Update player state based on decision consequences
    session.playerState.health = Math.max(0, Math.min(100, 
      session.playerState.health + decision.consequences.health));
    session.playerState.oxygen = Math.max(0, Math.min(100, 
      session.playerState.oxygen + decision.consequences.oxygen));
    session.playerState.visibility = Math.max(0, Math.min(100, 
      session.playerState.visibility + decision.consequences.visibility));

    // Record the decision
    session.decisions.push({
      nodeId: session.currentNodeId,
      decisionId: decision.id,
      timeTaken: timeTaken || 0,
      wasCorrect: decision.isCorrect
    });

    // Move to next node or end game
    if (decision.nextNodeId) {
      session.currentNodeId = decision.nextNodeId;
      const nextNode = scenario.nodes.find(node => node.id === decision.nextNodeId);
      
      // Check if the next node is an ending node
      if (nextNode && nextNode.isEnding) {
        session.isCompleted = true;
        session.endTime = new Date();
        session.completionTime = Math.floor((session.endTime - session.startTime) / 1000);
        
        // Use the ending type from the node, or determine from player state
        if (nextNode.endingType) {
          session.finalOutcome = nextNode.endingType;
        } else {
          // Fallback to health-based determination
          if (session.playerState.health <= 0) {
            session.finalOutcome = 'failure';
          } else if (session.playerState.health >= 80) {
            session.finalOutcome = 'success';
          } else {
            session.finalOutcome = 'partial';
          }
        }
        
        session.calculateScore();
        await session.save();
        
        // Update user stats
        await req.user.updateOne({
          $inc: { 
            'gameStats.totalGamesPlayed': 1,
            'gameStats.totalTimeSpent': session.completionTime
          },
          $addToSet: { 
            'gameStats.scenariosCompleted': scenario._id 
          }
        });
        
        return res.json({
          message: 'Game completed',
          session,
          gameEnded: true,
          currentNode: null,
          finalOutcome: session.finalOutcome,
          score: session.score,
          decision: {
            text: decision.text,
            consequences: decision.consequences,
            educationalNote: decision.educationalNote
          }
        });
      }
      
      // Continue to next node (not an ending)
      await session.save();
      
      res.json({
        message: 'Decision recorded',
        session,
        currentNode: nextNode,
        gameEnded: false,
        decision: {
          text: decision.text,
          consequences: decision.consequences,
          educationalNote: decision.educationalNote
        }
      });
    } else {
      // Game ended
      session.isCompleted = true;
      session.endTime = new Date();
      session.completionTime = Math.floor((session.endTime - session.startTime) / 1000);
      
      // Determine final outcome based on player state
      if (session.playerState.health <= 0) {
        session.finalOutcome = 'failure';
      } else if (session.playerState.health >= 80) {
        session.finalOutcome = 'success';
      } else {
        session.finalOutcome = 'partial';
      }

      session.calculateScore();
      await session.save();

      // Update user stats
      await req.user.updateOne({
        $inc: { 
          'gameStats.totalGamesPlayed': 1,
          'gameStats.totalTimeSpent': session.completionTime
        },
        $addToSet: { 
          'gameStats.scenariosCompleted': scenario._id 
        }
      });

      res.json({
        message: 'Game completed',
        session,
        gameEnded: true,
        currentNode: null,
        finalOutcome: session.finalOutcome,
        score: session.score,
        decision: {
          text: decision.text,
          consequences: decision.consequences,
          educationalNote: decision.educationalNote
        }
      });
    }

  } catch (error) {
    console.error('Decision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scenarios/sessions/my-progress
// @desc    Get user's game progress
// @access  Private
router.get('/sessions/my-progress', authMiddleware, async (req, res) => {
  try {
    const sessions = await GameSession.find({ user: req.user._id })
      .populate('scenario', 'title category difficulty')
      .sort({ createdAt: -1 });

    res.json({ sessions });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;