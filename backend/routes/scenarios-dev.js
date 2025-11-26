const express = require('express');
const router = express.Router();

// In-memory storage for development
let scenarios = [
  {
    _id: '1',
    title: 'Office Building Fire Emergency',
    description: 'A fire has broken out on the 15th floor of your office building. Smoke is starting to fill the corridors and you need to evacuate immediately. Your decisions will determine your survival.',
    category: 'office',
    difficulty: 'medium',
    estimatedDuration: 300,
    learningObjectives: [
      'Proper evacuation procedures for high-rise buildings',
      'Decision-making under time pressure',
      'Understanding fire behavior and smoke spread',
      'Use of emergency exits and stairwells'
    ],
    startingNode: 'office_start',
    nodes: [
      {
        id: 'office_start',
        title: 'Your Office - 15th Floor',
        description: 'You are working at your desk when the fire alarm suddenly goes off. You can smell smoke coming from the hallway. Your office is on the 15th floor of a 20-story building. Through your window, you can see fire trucks arriving below.',
        location: 'Your Office',
        environment: {
          smokeLevel: 10,
          fireSpread: 5,
          visibility: 90,
          temperature: 22
        },
        availableItems: ['wet towel', 'flashlight'],
        decisions: [
          {
            id: 'check_hallway',
            text: 'Open the door to check the hallway situation immediately',
            timeLimit: 15,
            consequences: { health: -5, visibility: -10 },
            nextNodeId: 'hallway_smoky',
            isCorrect: false,
            educationalNote: 'Opening doors in a fire can let in smoke and heat. Always check doors by feeling them first.'
          },
          {
            id: 'feel_door',
            text: 'Feel the door with the back of your hand before opening',
            timeLimit: 15,
            consequences: { health: 0 },
            nextNodeId: 'door_cool',
            isCorrect: true,
            educationalNote: 'Correct! Always check doors for heat before opening during a fire.'
          },
          {
            id: 'call_911',
            text: 'Call 911 immediately before doing anything else',
            timeLimit: 10,
            consequences: { health: 0 },
            nextNodeId: 'calling_help',
            isCorrect: true,
            educationalNote: 'Good thinking! Alerting emergency services is always important, but in a high-rise, building security may have already called.'
          },
          {
            id: 'gather_items',
            text: 'Quickly gather important documents and personal items',
            timeLimit: 20,
            consequences: { health: -10, oxygen: -5 },
            nextNodeId: 'wasted_time',
            isCorrect: false,
            educationalNote: 'In a fire emergency, your life is more important than possessions. Every second counts in evacuation.'
          }
        ],
        isEnding: false
      },
      {
        id: 'door_cool',
        title: 'Office Door - Cool to Touch',
        description: 'The door feels cool to the touch. This is a good sign - there is likely no fire directly outside your door. You can hear people in the hallway, some shouting directions. The fire alarm is still blaring.',
        location: 'Your Office',
        environment: {
          smokeLevel: 15,
          fireSpread: 8,
          visibility: 85,
          temperature: 24
        },
        availableItems: [],
        decisions: [
          {
            id: 'open_door_carefully',
            text: 'Carefully open the door and look into the hallway',
            timeLimit: 10,
            consequences: { health: 0, visibility: -5 },
            nextNodeId: 'hallway_assessment',
            isCorrect: true,
            educationalNote: 'Good! Since the door was cool, it\'s safer to open it carefully.'
          },
          {
            id: 'get_wet_towel',
            text: 'Get the wet towel first, then open the door',
            timeLimit: 15,
            consequences: { health: 5, visibility: 0 },
            nextNodeId: 'hallway_with_towel',
            isCorrect: true,
            educationalNote: 'Excellent! A wet towel can help filter smoke and protect your airways.'
          }
        ],
        isEnding: false
      },
      {
        id: 'hallway_assessment',
        title: 'Hallway - Light Smoke',
        description: 'The hallway has light smoke, but visibility is still decent. You can see other people heading toward the stairwell exit. The elevator bank is to your right, and emergency stairs are to your left. The smoke seems to be coming from the far end of the hallway.',
        location: 'Hallway',
        environment: {
          smokeLevel: 25,
          fireSpread: 12,
          visibility: 75,
          temperature: 28
        },
        availableItems: [],
        decisions: [
          {
            id: 'take_elevator',
            text: 'Take the elevator down - it will be faster',
            timeLimit: 10,
            consequences: { health: -20, oxygen: -15 },
            nextNodeId: 'elevator_danger',
            isCorrect: false,
            educationalNote: 'Never use elevators during a fire! They can malfunction, trap you, or take you to the fire floor.'
          },
          {
            id: 'use_stairs',
            text: 'Head to the emergency stairwell immediately',
            timeLimit: 10,
            consequences: { health: 0 },
            nextNodeId: 'stairwell_entry',
            isCorrect: true,
            educationalNote: 'Correct! Stairs are the only safe way to evacuate during a fire.'
          },
          {
            id: 'help_others',
            text: 'Help an elderly colleague who seems confused',
            timeLimit: 20,
            consequences: { health: -5, oxygen: -5 },
            nextNodeId: 'helping_colleague',
            isCorrect: true,
            educationalNote: 'Good instinct! Helping others is important, but ensure your own safety first.'
          }
        ],
        isEnding: false
      },
      {
        id: 'stairwell_entry',
        title: 'Emergency Stairwell - 15th Floor',
        description: 'You enter the stairwell. It\'s much clearer here - the smoke hasn\'t penetrated as much. You can see other people calmly but quickly making their way down. The stairwell is well-lit and you can hear emergency instructions echoing from below.',
        location: 'Stairwell',
        environment: {
          smokeLevel: 5,
          fireSpread: 8,
          visibility: 95,
          temperature: 25
        },
        availableItems: [],
        decisions: [
          {
            id: 'walk_down_calmly',
            text: 'Walk down calmly, staying to the right',
            timeLimit: 10,
            consequences: { health: 5 },
            nextNodeId: 'successful_evacuation',
            isCorrect: true,
            educationalNote: 'Perfect! Staying calm and orderly prevents panic and accidents on stairs.'
          },
          {
            id: 'run_down_fast',
            text: 'Run down as fast as possible to get out quickly',
            timeLimit: 5,
            consequences: { health: -10 },
            nextNodeId: 'stairs_accident',
            isCorrect: false,
            educationalNote: 'Running on stairs during evacuation is dangerous and can cause falls and block others.'
          }
        ],
        isEnding: false
      },
      {
        id: 'successful_evacuation',
        title: 'Ground Floor - Safety',
        description: 'You have successfully evacuated the building! You exit through the main lobby and are directed to the assembly point across the street by fire department personnel. You\'re safe, breathing fresh air, and can see the fire department working to control the situation.',
        location: 'Outside - Assembly Point',
        environment: {
          smokeLevel: 0,
          fireSpread: 0,
          visibility: 100,
          temperature: 20
        },
        availableItems: [],
        decisions: [],
        isEnding: true,
        endingType: 'success'
      },
      {
        id: 'elevator_danger',
        title: 'Elevator Shaft - Critical Danger',
        description: 'The elevator stops between floors and fills with smoke. You realize you\'ve made a critical error. The elevator doors won\'t open and smoke is getting thicker. This is a life-threatening situation.',
        location: 'Elevator - Between Floors',
        environment: {
          smokeLevel: 80,
          fireSpread: 25,
          visibility: 20,
          temperature: 45
        },
        availableItems: [],
        decisions: [],
        isEnding: true,
        endingType: 'failure'
      },
      {
        id: 'stairs_accident',
        title: 'Stairwell - Accident',
        description: 'While running down the stairs, you slip and fall, injuring your ankle. Other evacuees help you up, but you\'ve slowed the evacuation and put yourself at risk. You manage to continue down with assistance.',
        location: 'Stairwell',
        environment: {
          smokeLevel: 10,
          fireSpread: 15,
          visibility: 85,
          temperature: 28
        },
        availableItems: [],
        decisions: [
          {
            id: 'continue_with_help',
            text: 'Accept help and continue evacuating',
            timeLimit: 10,
            consequences: { health: -5 },
            nextNodeId: 'assisted_evacuation',
            isCorrect: true,
            educationalNote: 'Good! Accepting help when injured is important for everyone\'s safety.'
          }
        ],
        isEnding: false
      },
      {
        id: 'assisted_evacuation',
        title: 'Ground Floor - Injured but Safe',
        description: 'With help from other evacuees, you make it safely out of the building. Paramedics immediately attend to your ankle injury. You\'re alive and safe, though injured. This could have been avoided by walking calmly instead of running.',
        location: 'Outside - Medical Area',
        environment: {
          smokeLevel: 0,
          fireSpread: 0,
          visibility: 100,
          temperature: 20
        },
        availableItems: [],
        decisions: [],
        isEnding: true,
        endingType: 'partial'
      },
      {
        id: 'hallway_smoky',
        title: 'Hallway - Heavy Smoke',
        description: 'You opened the door without checking and thick smoke rushes into your office. Your visibility is severely reduced and you\'re coughing. This was a dangerous mistake.',
        location: 'Hallway',
        environment: {
          smokeLevel: 60,
          fireSpread: 20,
          visibility: 30,
          temperature: 35
        },
        availableItems: [],
        decisions: [
          {
            id: 'retreat_office',
            text: 'Retreat back to your office and close the door',
            timeLimit: 10,
            consequences: { health: 0, visibility: 10 },
            nextNodeId: 'office_start',
            isCorrect: true,
            educationalNote: 'Good recovery! When smoke is too thick, retreat and find another way.'
          },
          {
            id: 'push_through',
            text: 'Push through the smoke to find the exit',
            timeLimit: 5,
            consequences: { health: -15, oxygen: -20 },
            nextNodeId: 'lost_in_smoke',
            isCorrect: false,
            educationalNote: 'Dangerous! Never push through heavy smoke - you can lose your way and succumb to smoke inhalation.'
          }
        ],
        isEnding: false
      },
      {
        id: 'wasted_time',
        title: 'Time Wasted Gathering Items',
        description: 'You have spent precious time gathering documents and personal items. The smoke is getting thicker and you can hear the fire spreading. Your health has decreased due to smoke inhalation, and escape routes may now be more limited.',
        location: 'Your Office',
        environment: {
          smokeLevel: 25,
          fireSpread: 15,
          visibility: 70,
          temperature: 28
        },
        availableItems: ['documents', 'personal items'],
        decisions: [
          {
            id: 'feel_door_late',
            text: 'Now feel the door before opening it',
            timeLimit: 10,
            consequences: { health: 0 },
            nextNodeId: 'door_cool',
            isCorrect: true,
            educationalNote: 'Better late than never, but you should have done this first before wasting time on items.'
          },
          {
            id: 'panic_exit',
            text: 'Panic and rush to open the door immediately',
            timeLimit: 5,
            consequences: { health: -10, visibility: -15 },
            nextNodeId: 'hallway_smoky',
            isCorrect: false,
            educationalNote: 'Panic leads to poor decisions. Always check doors even when time is limited.'
          }
        ],
        isEnding: false
      },
      {
        id: 'calling_help',
        title: 'Calling Emergency Services',
        description: 'You dial 911 and quickly explain the situation. The operator informs you that they are already aware of the fire and emergency responders are on scene. They advise you to evacuate immediately using the stairs. You feel somewhat reassured but know you need to act fast.',
        location: 'Your Office',
        environment: {
          smokeLevel: 12,
          fireSpread: 7,
          visibility: 88,
          temperature: 23
        },
        availableItems: ['wet towel', 'flashlight'],
        decisions: [
          {
            id: 'feel_door_after_call',
            text: 'Feel the door with the back of your hand before opening',
            timeLimit: 10,
            consequences: { health: 0 },
            nextNodeId: 'door_cool',
            isCorrect: true,
            educationalNote: 'Excellent! You called for help and are following proper evacuation procedures.'
          },
          {
            id: 'grab_towel_first',
            text: 'Grab the wet towel before checking the door',
            timeLimit: 15,
            consequences: { health: 5, visibility: 5 },
            nextNodeId: 'hallway_with_towel',
            isCorrect: true,
            educationalNote: 'Good thinking! A wet towel can help with smoke protection.'
          }
        ],
        isEnding: false
      },
      {
        id: 'hallway_with_towel',
        title: 'Hallway - Protected with Wet Towel',
        description: 'You have the wet towel covering your nose and mouth, which helps filter some of the smoke. The hallway has light smoke but is still navigable. You can see the elevator area to your left and the emergency exit signs pointing right toward the stairwell.',
        location: 'Hallway',
        environment: {
          smokeLevel: 20,
          fireSpread: 10,
          visibility: 80,
          temperature: 26
        },
        availableItems: ['wet towel'],
        decisions: [
          {
            id: 'towel_to_stairs',
            text: 'Head to the stairwell immediately with the towel',
            timeLimit: 10,
            consequences: { health: 5, oxygen: 5 },
            nextNodeId: 'stairwell_entry',
            isCorrect: true,
            educationalNote: 'Perfect! You are properly protected and taking the safest evacuation route.'
          },
          {
            id: 'towel_help_others',
            text: 'Look for others who might need help',
            timeLimit: 20,
            consequences: { health: 0, oxygen: -5 },
            nextNodeId: 'hallway_assessment',
            isCorrect: true,
            educationalNote: 'Helping others is admirable, but ensure your own safety first.'
          }
        ],
        isEnding: false
      },
      {
        id: 'lost_in_smoke',
        title: 'Lost in Heavy Smoke',
        description: 'You are now lost in the heavy smoke, disoriented and struggling to breathe. Your health is declining rapidly. This situation is becoming critical.',
        location: 'Hallway - Heavy Smoke',
        environment: {
          smokeLevel: 80,
          fireSpread: 30,
          visibility: 10,
          temperature: 40
        },
        availableItems: [],
        decisions: [],
        isEnding: true,
        endingType: 'failure'
      }
    ],
    metadata: {
      version: '1.0.0',
      tags: ['office', 'high-rise', 'evacuation', 'decision-making'],
      isPublished: true,
      playCount: 0,
      averageRating: 0,
      averageCompletionTime: 0
    }
  }
];

let gameSessions = {};

// @route   GET /api/scenarios-dev
// @desc    Get all scenarios (development)
// @access  Public
router.get('/', (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    
    let filteredScenarios = scenarios;
    
    if (category) {
      filteredScenarios = filteredScenarios.filter(s => s.category === category);
    }
    if (difficulty) {
      filteredScenarios = filteredScenarios.filter(s => s.difficulty === difficulty);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedScenarios = filteredScenarios.slice(startIndex, endIndex);

    res.json({
      scenarios: paginatedScenarios.map(s => ({
        _id: s._id,
        title: s.title,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        estimatedDuration: s.estimatedDuration,
        learningObjectives: s.learningObjectives,
        metadata: {
          playCount: s.metadata.playCount,
          averageRating: s.metadata.averageRating
        }
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredScenarios.length / limit),
        total: filteredScenarios.length
      }
    });
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scenarios-dev/:id
// @desc    Get scenario by ID (development)
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const scenario = scenarios.find(s => s._id === req.params.id);
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    res.json({ scenario });
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/scenarios-dev/:id/start
// @desc    Start a new game session (development)
// @access  Public (simplified for development)
router.post('/:id/start', (req, res) => {
  try {
    const scenario = scenarios.find(s => s._id === req.params.id);
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    // Get user info from request body (for development)
    const { userId, username } = req.body;

    // Create new game session
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const gameSession = {
      _id: sessionId,
      scenario: req.params.id,
      userId: userId || 'guest',
      username: username || 'Guest Player',
      currentNodeId: scenario.startingNode,
      playerState: {
        health: 100,
        oxygen: 100,
        visibility: 100,
        inventory: [],
        location: scenario.nodes.find(n => n.id === scenario.startingNode)?.location || 'Unknown'
      },
      decisions: [],
      isCompleted: false,
      startTime: new Date()
    };

    // Store session in memory
    gameSessions[sessionId] = gameSession;

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

// @route   POST /api/scenarios-dev/sessions/:sessionId/decision
// @desc    Make a decision in the game (development)
// @access  Public (simplified for development)
router.post('/sessions/:sessionId/decision', (req, res) => {
  try {
    const { decisionId, timeTaken } = req.body;
    const session = gameSessions[req.params.sessionId];

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    const scenario = scenarios.find(s => s._id === session.scenario);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

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
      session.playerState.health + (decision.consequences.health || 0)));
    session.playerState.oxygen = Math.max(0, Math.min(100, 
      session.playerState.oxygen + (decision.consequences.oxygen || 0)));
    session.playerState.visibility = Math.max(0, Math.min(100, 
      session.playerState.visibility + (decision.consequences.visibility || 0)));

    // Record the decision
    session.decisions.push({
      nodeId: session.currentNodeId,
      decisionId: decision.id,
      timeTaken: timeTaken || 0,
      wasCorrect: decision.isCorrect,
      timestamp: new Date()
    });

    // Check if player died
    if (session.playerState.health <= 0) {
      session.isCompleted = true;
      session.endTime = new Date();
      session.finalOutcome = 'failure';
      
      return res.json({
        message: 'Game ended - player died',
        session,
        gameEnded: true,
        finalOutcome: 'failure',
        decision: {
          text: decision.text,
          consequences: decision.consequences,
          educationalNote: decision.educationalNote
        }
      });
    }

    // Move to next node or end game
    if (decision.nextNodeId) {
      session.currentNodeId = decision.nextNodeId;
      const nextNode = scenario.nodes.find(node => node.id === decision.nextNodeId);
      
      if (nextNode) {
        session.playerState.location = nextNode.location;
        
        // Check if this is an ending node
        if (nextNode.isEnding) {
          session.isCompleted = true;
          session.endTime = new Date();
          session.finalOutcome = nextNode.endingType;
          
          return res.json({
            message: 'Game completed',
            session,
            currentNode: nextNode,
            gameEnded: true,
            finalOutcome: nextNode.endingType,
            decision: {
              text: decision.text,
              consequences: decision.consequences,
              educationalNote: decision.educationalNote
            }
          });
        }
        
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
        return res.status(400).json({ message: 'Next node not found' });
      }
    } else {
      // No next node - game should end
      session.isCompleted = true;
      session.endTime = new Date();
      session.finalOutcome = 'completed';
      
      res.json({
        message: 'Game completed',
        session,
        currentNode: null,
        gameEnded: true,
        finalOutcome: 'completed',
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

// @route   GET /api/scenarios-dev/leaderboard
// @desc    Get leaderboard (development)
// @access  Public
router.get('/leaderboard', (req, res) => {
  try {
    const { limit = 10, sortBy = 'highScore' } = req.query;

    // Calculate leaderboard from game sessions
    const userScores = {};

    Object.values(gameSessions).forEach(session => {
      if (session.isCompleted && session.finalOutcome === 'success') {
        const userId = session.userId || 'guest';
        const username = session.username || 'Guest Player';
        
        // Calculate score based on various factors
        const timeScore = session.endTime && session.startTime 
          ? Math.max(0, 300 - Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000)) * 0.5 
          : 0;
        const healthScore = session.playerState.health * 0.3;
        const decisionAccuracy = session.decisions.length > 0
          ? session.decisions.filter(d => d.wasCorrect).length / session.decisions.length
          : 0;
        const knowledgeScore = decisionAccuracy * 50;
        const totalScore = Math.round(100 + timeScore + healthScore + knowledgeScore);

        if (!userScores[userId]) {
          userScores[userId] = {
            _id: userId,
            username: username,
            highScore: totalScore,
            totalGames: 1,
            totalScore: totalScore,
            bestTime: session.endTime && session.startTime 
              ? Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000)
              : null
          };
        } else {
          userScores[userId].totalGames += 1;
          userScores[userId].totalScore += totalScore;
          userScores[userId].highScore = Math.max(userScores[userId].highScore, totalScore);
          
          const currentTime = session.endTime && session.startTime 
            ? Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000)
            : null;
          
          if (currentTime && (!userScores[userId].bestTime || currentTime < userScores[userId].bestTime)) {
            userScores[userId].bestTime = currentTime;
          }
        }
      }
    });

    // Convert to array and add average score
    let leaderboard = Object.values(userScores).map(user => ({
      ...user,
      averageScore: Math.round(user.totalScore / user.totalGames * 10) / 10
    }));

    // Sort based on sortBy parameter
    if (sortBy === 'avgScore') {
      leaderboard.sort((a, b) => b.averageScore - a.averageScore);
    } else if (sortBy === 'totalGames') {
      leaderboard.sort((a, b) => b.totalGames - a.totalGames || b.highScore - a.highScore);
    } else {
      leaderboard.sort((a, b) => b.highScore - a.highScore);
    }

    // Limit results
    leaderboard = leaderboard.slice(0, parseInt(limit));

    // Add rank
    leaderboard = leaderboard.map((entry, index) => ({
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
