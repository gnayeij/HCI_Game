import React, { useEffect, useRef, useState } from 'react';
import './GameConsole.css';

const GameConsole = ({ 
  gameHistory, 
  currentNode, 
  onDecision, 
  onStartTimer, 
  isActive 
}) => {
  const consoleRef = useRef(null);
  const [showDecisions, setShowDecisions] = useState(false);

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [gameHistory]);

  useEffect(() => {
    // Show decisions after a brief delay for dramatic effect
    if (currentNode && currentNode.decisions) {
      console.log('GameConsole: currentNode received, will show decisions in 1.5s');
      console.log('GameConsole: currentNode decisions:', currentNode.decisions);
      const timer = setTimeout(() => {
        console.log('GameConsole: Setting showDecisions to true');
        setShowDecisions(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      console.log('GameConsole: No currentNode or decisions, hiding decisions');
      console.log('GameConsole: currentNode:', currentNode);
      setShowDecisions(false);
    }
  }, [currentNode]);

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

        {showDecisions && currentNode && currentNode.decisions && (
          <div className="decisions-container">
            <div className="decisions-prompt">
              <span className="prompt-icon">🤔</span>
              <p>What do you do?</p>
            </div>
            
            <div className="decisions-list">
              {currentNode.decisions.map((decision, index) => (
                <button
                  key={decision.id}
                  className="decision-button"
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