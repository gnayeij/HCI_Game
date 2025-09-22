import React, { useState, useEffect } from 'react';
import './GameTimer.css';

const GameTimer = ({ timeRemaining, onTimeUp }) => {
  const [currentTime, setCurrentTime] = useState(timeRemaining);

  useEffect(() => {
    setCurrentTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (currentTime <= 0) {
      return; // Don't call onTimeUp here, let the interval handle it
    }

    const timer = setInterval(() => {
      setCurrentTime(prev => {
        if (prev <= 1) {
          onTimeUp(); // Only call onTimeUp once from here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime, onTimeUp]);

  const getTimerColor = () => {
    const percentage = (currentTime / timeRemaining) * 100;
    if (percentage > 50) return 'green';
    if (percentage > 25) return 'yellow';
    return 'red';
  };

  const getUrgencyClass = () => {
    if (currentTime <= 5) return 'critical';
    if (currentTime <= 10) return 'warning';
    return '';
  };

  return (
    <div className={`game-timer ${getUrgencyClass()}`}>
      <div className="timer-icon">⏰</div>
      <div className="timer-content">
        <div className="timer-label">Decision Time</div>
        <div className={`timer-value ${getTimerColor()}`}>
          {currentTime}s
        </div>
      </div>
      <div className="timer-progress">
        <div 
          className={`progress-fill ${getTimerColor()}`}
          style={{ 
            width: `${(currentTime / timeRemaining) * 100}%`,
            transition: 'width 1s linear'
          }}
        />
      </div>
    </div>
  );
};

export default GameTimer;