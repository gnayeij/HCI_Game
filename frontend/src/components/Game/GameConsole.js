import React, { useEffect, useRef, useState } from 'react';
import CompletionLeaderboard from './CompletionLeaderboard';
import './GameConsole.css';

const GameConsole = ({ 
  gameHistory, 
  currentNode, 
  onDecision, 
  onStartTimer, 
  isActive,
  gameStatus,
  finalOutcome,
  playerScore,
  onTryAgain,
  onReturnHome
}) => {
  const consoleRef = useRef(null);
  const [showDecisions, setShowDecisions] = useState(false);

  // Helper function to get completion display based on outcome
  const getCompletionDisplay = () => {
    switch (finalOutcome) {
      case 'success':
        return {
          icon: '🎉✨',
          status: 'SUCCESS',
          statusClass: 'status-success'
        };
      case 'failure':
        return {
          icon: '💀🔥',
          status: 'GAME OVER',
          statusClass: 'status-failure'
        };
      case 'partial':
        return {
          icon: '⚠️🏃',
          status: 'EVACUATED',
          statusClass: 'status-partial'
        };
      default:
        return {
          icon: '🚪🏃',
          status: 'COMPLETED',
          statusClass: 'status-default'
        };
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [gameHistory]);

  useEffect(() => {
    // Show decisions after a brief delay for dramatic effect, but ONLY if game is still playing
    if (currentNode && currentNode.decisions && currentNode.decisions.length > 0 && gameStatus === 'playing') {
      console.log('GameConsole: currentNode received, will show decisions in 1.5s');
      console.log('GameConsole: currentNode decisions:', currentNode.decisions);
      const timer = setTimeout(() => {
        console.log('GameConsole: Setting showDecisions to true');
        setShowDecisions(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      console.log('GameConsole: No currentNode or decisions, or game not playing, hiding decisions');
      console.log('GameConsole: currentNode:', currentNode);
      console.log('GameConsole: gameStatus:', gameStatus);
      setShowDecisions(false);
    }
  }, [currentNode, gameStatus]);

  const handleDecisionClick = (decision) => {
    if (!isActive) return;
    
    console.log('Decision clicked:', decision);
    console.log('Decision ID:', decision.id);
    
    setShowDecisions(false);
    // No longer pass individual time limit since we use unified timer
    onDecision(decision);
  };

  const getHistoryEntryClass = (entry) => {
    switch (entry.type) {
      case 'narration': return 'history-narration';
      case 'location': return 'history-location';
      case 'decision': return entry.isCorrect ? 'history-decision correct' : 'history-decision incorrect';
      case 'feedback': return entry.isCorrect ? 'history-feedback correct' : 'history-feedback incorrect';
      case 'timeout': return 'history-timeout';
      case 'ending': return 'history-ending';
      default: return 'history-default';
    }
  };

  const getHistoryIcon = (entry) => {
    switch (entry.type) {
      case 'narration': return '📖';
      case 'location': return '📍';
      case 'decision': return entry.isCorrect ? '✅' : '❌';
      case 'feedback': return '💡';
      case 'timeout': return '⏰';
      case 'ending': return '🏁';
      default: return '•';
    }
  };

  return (
    <div className="game-console">
      <div className="console-header">
        <div className="console-title">Fire Emergency Scenario</div>
        <div className="console-status">
          <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="console-content" ref={consoleRef}>
        {gameHistory.map((entry, index) => (
          <div key={index} className={`history-entry ${getHistoryEntryClass(entry)}`}>
            <span className="entry-icon">{getHistoryIcon(entry)}</span>
            <div className="entry-content">
              <p>{entry.content}</p>
              <span className="entry-timestamp">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {showDecisions && currentNode && currentNode.decisions && currentNode.decisions.length > 0 && gameStatus === 'playing' && (
          <div className="decisions-container">
            <div className="decisions-prompt">
              <span className="prompt-icon">🤔</span>
              <p>What do you do?</p>
            </div>
            
            <div className="decisions-list">
              {currentNode.decisions.map((decision, index) => (
                <button
                  key={decision.id}
                  className={`decision-button decision-option ${index === 0 ? 'first-decision' : ''}`}
                  onClick={() => handleDecisionClick(decision)}
                  disabled={!isActive}
                >
                  <div className="decision-number">{index + 1}</div>
                  <div className="decision-content">
                    <div className="decision-text">{decision.text}</div>
                    <div className="decision-meta">
                      {decision.requiredItems && decision.requiredItems.length > 0 && (
                        <span className="required-items">
                          📦 Requires: {decision.requiredItems.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameStatus === 'completed' && (
          <div className="game-completion-container">
            <div className={`completion-card ${getCompletionDisplay().statusClass}`}>
              <div className="completion-icon">
                <span role="img" aria-label="completion">{getCompletionDisplay().icon}</span>
              </div>
              <div className="completion-status">{getCompletionDisplay().status}</div>
              <div className="completion-details">
                <div className="completion-stat">
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">
                    {playerScore?.completionTime 
                      ? `${Math.floor(playerScore.completionTime / 60)}m ${playerScore.completionTime % 60}s` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="completion-stat">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{playerScore?.score?.total || 0}</span>
                </div>
              </div>
              
              {/* Leaderboard and Comparison Component */}
              <CompletionLeaderboard playerScore={playerScore} />
              
              <div className="completion-actions">
                <button className="completion-btn try-again-btn" onClick={onTryAgain}>
                  Try Again
                </button>
                <button className="completion-btn home-btn" onClick={onReturnHome}>
                  Return Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="console-footer">
        <div className="typing-indicator">
          <span>🔥</span>
          <span>Emergency situation in progress...</span>
        </div>
      </div>
    </div>
  );
};

export default GameConsole;