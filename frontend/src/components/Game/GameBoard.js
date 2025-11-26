import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTutorial } from '../../contexts/TutorialContext';
import { scenariosAPI } from '../../services/api';
import GameConsole from './GameConsole';
import GameSidebar from './GameSidebar';
import GameTimer from './GameTimer';
import SmokeEffect from './SmokeEffect';
import './GameBoard.css';

const GameBoard = () => {
  const { scenarioId, difficulty } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { nextStep, isStepActive, skipTutorial } = useTutorial();
  
  // Determine base decision time based on difficulty
  const getBaseDecisionTime = (diff) => {
    switch (diff) {
      case 'easy':
        return 30;
      case 'medium':
        return 20;
      case 'hard':
        return 10;
      default:
        return 20; // Default to medium if something goes wrong
    }
  };
  
  const BASE_DECISION_TIME = getBaseDecisionTime(difficulty);
  
  // Calculate decision time based on oxygen level (rounded up)
  const calculateDecisionTime = (oxygenLevel) => {
    const baseTime = BASE_DECISION_TIME;
    const adjustedTime = baseTime * (oxygenLevel / 100);
    return Math.ceil(adjustedTime); // Round up
  };
  
  console.log('GameBoard - Auth state:', { user, token: token ? 'Present' : 'Missing', isAuthenticated });
  console.log('GameBoard - Scenario ID:', scenarioId);
  console.log('GameBoard - Difficulty:', difficulty);
  console.log('GameBoard - Base Decision Time:', BASE_DECISION_TIME);
  
  const [gameState, setGameState] = useState({
    scenario: null,
    session: null,
    currentNode: null,
    playerState: {
      health: 100,
      oxygen: 100,
      visibility: 100,
      inventory: [],
      location: ''
    },
    gameStatus: 'loading', // loading, playing, paused, completed
    timeRemaining: null,
    isTimerActive: false,
    timeoutCount: 0 // Track how many times user has timed out
  });

  const [gameHistory, setGameHistory] = useState([]);
  const timeoutProcessingRef = useRef(false); // Prevent duplicate timeouts

  const initializeGame = useCallback(async () => {
    try {
      console.log('Initializing game for scenario:', scenarioId);
      
      // Get scenario details first
      const scenarioResponse = await scenariosAPI.getScenario(scenarioId);
      console.log('Scenario response:', scenarioResponse);
      const scenario = scenarioResponse.data.scenario;

      // Start a new game session with the backend
      const gameResponse = await scenariosAPI.startGame(scenarioId);
      console.log('Game response:', gameResponse);
      console.log('Game response data:', JSON.stringify(gameResponse.data, null, 2));
      console.log('Game response status:', gameResponse.status);
      console.log('Game response headers:', gameResponse.headers);
      
      // Check what fields are actually present
      console.log('Fields in gameResponse.data:', Object.keys(gameResponse.data || {}));
      
      const { session, currentNode } = gameResponse.data;

      console.log('Setting game state with:', { scenario, session, currentNode });
      
      // Debug the current node structure
      console.log('Current node:', currentNode);
      console.log('Current node decisions:', currentNode?.decisions);
      console.log('Current node type:', typeof currentNode);
      console.log('Is currentNode null/undefined?', currentNode == null);

      setGameState({
        scenario: scenario,
        session: session,
        currentNode: currentNode,
        playerState: session.playerState,
        gameStatus: 'playing',
        timeRemaining: calculateDecisionTime(session.playerState.oxygen), // Use oxygen-adjusted timer
        isTimerActive: false,
        timeoutCount: 0 // Track how many times user has timed out
      });

      // Validate and log current node data
      console.log('Current node loaded successfully:', currentNode?.title);
      console.log('Decisions available:', currentNode?.decisions?.length || 0);

      // Add initial description to game history
      setGameHistory([
        {
          type: 'narration',
          content: scenario.description,
          timestamp: Date.now()
        },
        {
          type: 'location',
          content: `${currentNode?.title || 'Unknown Location'}: ${currentNode?.description || 'No description available'}`,
          timestamp: Date.now()
        }
      ]);

      // Start timer for initial decision
      if (currentNode && currentNode.decisions && currentNode.decisions.length > 0) {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            timeRemaining: calculateDecisionTime(prev.playerState.oxygen), // Use oxygen-adjusted timer
            isTimerActive: true
          }));
        }, 2000); // Give player time to read the scenario
      }

    } catch (error) {
      console.error('Error initializing game:', error);
      console.error('Error response:', error.response);
      
      // Better error handling - show error state instead of navigating away
      setGameState(prev => ({
        ...prev,
        gameStatus: 'error',
        error: error.response?.data?.message || error.message || 'Failed to initialize game'
      }));
    }
  }, [scenarioId, BASE_DECISION_TIME]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleDecision = async (decision) => {
    if (gameState.gameStatus !== 'playing') {
      console.log('Game not in playing state, ignoring decision');
      return;
    }

    // If this is the first decision in tutorial, advance to completion screen
    if (isStepActive('game-decision')) {
      nextStep(); // Move to completion screen (step 5)
      // Don't auto-close - let user click "Finish" button
    }

    // Stop timer when a decision is made and reset timeout processing flag
    setGameState(prev => ({
      ...prev,
      isTimerActive: false
    }));
    timeoutProcessingRef.current = false; // Reset timeout processing flag

    if (!gameState.session || !gameState.session._id) {
      console.error('No valid session found');
      setGameHistory(prev => [...prev, {
        type: 'error',
        content: 'Game session expired. Please restart the game.',
        timestamp: Date.now()
      }]);
      return;
    }

    try {
      console.log('Making decision:', decision);
      console.log('Session ID:', gameState.session._id);
      console.log('Decision data:', {
        decisionId: decision.id,
        timeTaken: gameState.timeRemaining ? (decision.timeLimit - gameState.timeRemaining) : 0
      });

      // Make the decision via the API
      const response = await scenariosAPI.makeDecision(gameState.session._id, {
        decisionId: decision.id,
        timeTaken: gameState.timeRemaining ? (decision.timeLimit - gameState.timeRemaining) : 0
      });

      console.log('Decision response:', response);

      const { session, currentNode, gameEnded, finalOutcome, decision: decisionResult } = response.data;

      console.log('Game ended?', gameEnded);
      console.log('Final outcome:', finalOutcome);
      console.log('Current node:', currentNode);

      // Add decision to history
      const newHistoryEntry = {
        type: 'decision',
        content: `You chose: ${decisionResult.text}`,
        timestamp: Date.now(),
        isCorrect: decision.isCorrect
      };

      setGameHistory(prev => [...prev, newHistoryEntry]);

      // Add consequence feedback
      if (decisionResult.educationalNote) {
        const feedbackEntry = {
          type: 'feedback',
          content: decisionResult.educationalNote,
          timestamp: Date.now(),
          isCorrect: decision.isCorrect
        };
        setGameHistory(prev => [...prev, feedbackEntry]);
      }

      // Update game state
      if (gameEnded) {
        console.log('Game has ended, setting status to completed');
        setGameState(prev => ({
          ...prev,
          playerState: session.playerState,
          session: session,
          finalOutcome: finalOutcome,
          gameStatus: 'completed',
          currentNode: null,
          isTimerActive: false
        }));

        // Add ending message
        let endingMessage = '';
        if (finalOutcome === 'success') {
          endingMessage = '🎉 Congratulations! You successfully navigated the emergency situation.';
        } else if (finalOutcome === 'failure') {
          endingMessage = '💀 Game Over: You have succumbed to the emergency. Learn from this experience.';
        } else if (finalOutcome === 'partial') {
          endingMessage = '⚠️ You survived but with consequences. Consider how you could have done better.';
        }

        setGameHistory(prev => [...prev, {
          type: 'ending',
          content: endingMessage,
          timestamp: Date.now()
        }]);
      } else {
        // Continue to next node
        setGameState(prev => ({
          ...prev,
          playerState: session.playerState,
          currentNode: currentNode,
          timeRemaining: calculateDecisionTime(session.playerState.oxygen), // Use oxygen-adjusted timer
          isTimerActive: false
        }));

        // Add next scenario description
        setTimeout(() => {
          setGameHistory(prev => [...prev, {
            type: 'location',
            content: `${currentNode.title}: ${currentNode.description}`,
            timestamp: Date.now()
          }]);
          
          // Start timer for new decision
          if (currentNode && currentNode.decisions && currentNode.decisions.length > 0) {
            setGameState(prev => ({
              ...prev,
              timeRemaining: calculateDecisionTime(prev.playerState.oxygen), // Use oxygen-adjusted timer
              isTimerActive: true
            }));
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error making decision:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error processing your decision. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setGameHistory(prev => [...prev, {
        type: 'error',
        content: errorMessage,
        timestamp: Date.now()
      }]);
    }
  };

  const handleTimeUp = () => {
    console.log('handleTimeUp called, isTimerActive:', gameState.isTimerActive);
    console.log('timeoutProcessingRef.current:', timeoutProcessingRef.current);
    
    // Prevent multiple timeout triggers with both state and ref checks
    if (!gameState.isTimerActive || timeoutProcessingRef.current) {
      console.log('Timer already handled or processing, ignoring duplicate timeout');
      return;
    }

    console.log('Processing timeout, setting processing flag');
    timeoutProcessingRef.current = true; // Set processing flag immediately
    
    // IMMEDIATELY stop the timer to prevent any more calls
    setGameState(prev => ({
      ...prev,
      isTimerActive: false
    }));

    // Progressive penalty system based on timeout count
    const newTimeoutCount = gameState.timeoutCount + 1;
    console.log('New timeout count:', newTimeoutCount);
    
    let healthPenalty, oxygenPenalty, visibilityPenalty, educationalMessage;
    
    if (newTimeoutCount === 1) {
      // First timeout - lighter penalty, educational focus
      healthPenalty = 10;
      oxygenPenalty = 15;
      visibilityPenalty = 5;
      educationalMessage = "⏰ HESITATION DETECTED! In a real fire, every second of hesitation reduces your survival chances. Smoke inhalation and heat exposure increase rapidly. Health -10, Oxygen -15, Visibility -5.";
    } else if (newTimeoutCount === 2) {
      // Second timeout - moderate penalty, urgency building
      healthPenalty = 15;
      oxygenPenalty = 20;
      visibilityPenalty = 10;
      educationalMessage = "⏰ CRITICAL INDECISION! Fire doubles in size every 30 seconds. Thick smoke is filling the area and you're breathing toxic gases. Indecision is deadly in emergencies. Health -15, Oxygen -20, Visibility -10.";
    } else {
      // Third+ timeout - severe penalty, life-threatening
      healthPenalty = 20;
      oxygenPenalty = 25;
      visibilityPenalty = 15;
      educationalMessage = "⏰ FATAL DELAY! You're losing consciousness from smoke inhalation. Emergency responders emphasize: decisive action over perfect decisions. In real fires, this level of delay often proves fatal. Health -20, Oxygen -25, Visibility -15.";
    }

    // Apply progressive penalties in a separate state update
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        timeoutCount: newTimeoutCount,
        playerState: {
          ...prev.playerState,
          health: Math.max(0, prev.playerState.health - healthPenalty),
          oxygen: Math.max(0, prev.playerState.oxygen - oxygenPenalty),
          visibility: Math.max(0, prev.playerState.visibility - visibilityPenalty)
        }
      }));

      // Add penalty message to history
      setGameHistory(prev => [...prev, {
        type: 'timeout',
        content: educationalMessage,
        timestamp: Date.now()
      }]);

      // After penalty, restart timer for the same choices (no auto-decision)
      setTimeout(() => {
        if (gameState.currentNode?.decisions && gameState.currentNode.decisions.length > 0) {
          setGameHistory(prev => [...prev, {
            type: 'narration',
            content: '💭 You must make a decision now. Choose carefully and quickly.',
            timestamp: Date.now()
          }]);
          
          // Restart timer for same decision
          setGameState(prev => ({
            ...prev,
            timeRemaining: calculateDecisionTime(prev.playerState.oxygen), // Use oxygen-adjusted timer
            isTimerActive: true
          }));
          
          // Reset processing flag
          timeoutProcessingRef.current = false;
        }
      }, 2500); // Give time to read penalty message
    }, 100); // Small delay to ensure timer is stopped first
  };

  const handleTryAgain = () => {
    // Reset game state and restart
    initializeGame();
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleBackToScenarios = () => {
    // Only show confirmation if game is in progress
    if (gameState.gameStatus === 'playing') {
      const confirmed = window.confirm(
        'Are you sure you want to leave this game? Your progress will be lost.'
      );
      if (confirmed) {
        navigate('/scenarios');
      }
    } else {
      // If game is completed or in error state, navigate directly
      navigate('/scenarios');
    }
  };

  if (gameState.gameStatus === 'loading') {
    return (
      <div className="game-loading">
        <div className="loading-spinner">Loading scenario...</div>
      </div>
    );
  }

  if (gameState.gameStatus === 'error') {
    return (
      <div className="game-error">
        <div className="error-container">
          <h2>Game Error</h2>
          <p>{gameState.error}</p>
          <button onClick={() => navigate('/scenarios')} className="back-button">
            Back to Scenarios
          </button>
          <button onClick={initializeGame} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Debug: Log game state for smoke effect
  console.log('GameBoard render - Smoke conditions:', {
    gameStatus: gameState.gameStatus,
    isTimerActive: gameState.isTimerActive,
    timeRemaining: gameState.timeRemaining,
    shouldShowSmoke: gameState.gameStatus === 'playing' && gameState.isTimerActive
  });

  return (
    <div className="game-board">
      {/* Smoke effect background - intensity increases as timer counts down */}
      {/* Simplified condition: show whenever game is playing */}
      {gameState.gameStatus === 'playing' && (
        <SmokeEffect
          timeRemaining={gameState.timeRemaining || 0}
          maxTime={calculateDecisionTime(gameState.playerState.oxygen)}
          oxygenLevel={gameState.playerState.oxygen}
        />
      )}
      
      <div className="game-header">
        <button 
          className="back-to-scenarios-button" 
          onClick={handleBackToScenarios}
          aria-label="Back to Scenarios"
        >
          <span className="back-arrow">←</span>
          <span className="back-text">Back to Scenarios</span>
        </button>
        <div className="header-title-section">
          <h1>{gameState.scenario?.title}</h1>
          <span className={`difficulty-badge-game ${difficulty}`}>
            {difficulty === 'easy' && '🌱 Easy'}
            {difficulty === 'medium' && '⚡ Medium'}
            {difficulty === 'hard' && '🔥 Hard'}
            {' - '}{BASE_DECISION_TIME}s base time
          </span>
        </div>
        <div className="timer-placeholder">
          {gameState.isTimerActive && (
            <GameTimer
              timeRemaining={gameState.timeRemaining}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>
      </div>

      <div className="game-content">
        <div className="game-main">
          <GameConsole
            gameHistory={gameHistory}
            currentNode={gameState.currentNode}
            onDecision={handleDecision}
            isActive={gameState.gameStatus === 'playing'}
            gameStatus={gameState.gameStatus}
            finalOutcome={gameState.finalOutcome}
            playerScore={gameState.session}
            onTryAgain={handleTryAgain}
            onReturnHome={handleReturnHome}
          />
        </div>

        <div className="game-sidebar">
          <GameSidebar
            playerState={gameState.playerState}
            currentLocation={gameState.currentNode?.location}
            scenario={gameState.scenario}
            timeoutCount={gameState.timeoutCount}
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;