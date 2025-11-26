import React from 'react';
import './GameSidebar.css';

const GameSidebar = ({ playerState, currentLocation, scenario, timeoutCount }) => {
  const getHealthColor = (health) => {
    if (health >= 70) return 'green';
    if (health >= 40) return 'yellow';
    return 'red';
  };

  const getOxygenColor = (oxygen) => {
    if (oxygen >= 70) return 'blue';
    if (oxygen >= 40) return 'yellow';
    return 'red';
  };

  const getTimeoutUrgency = (count) => {
    if (count === 0) return 'safe';
    if (count === 1) return 'warning';
    if (count === 2) return 'danger';
    return 'critical';
  };

  const getTimeoutMessage = (count) => {
    if (count === 0) return 'Decisive';
    if (count === 1) return 'Hesitant';
    if (count === 2) return 'Dangerous';
    return 'Critical';
  };

  const StatBar = ({ label, value, color, icon }) => (
    <div className="stat-bar">
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}%</span>
      </div>
      <div className="stat-progress">
        <div 
          className={`stat-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="game-sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">
          <span className="section-icon">👤</span>
          Player Status
        </h3>
        
        <div className="status-container">
          <StatBar 
            label="Health" 
            value={playerState.health} 
            color={getHealthColor(playerState.health)}
            icon="❤️"
          />
          <StatBar 
            label="Oxygen" 
            value={playerState.oxygen} 
            color={getOxygenColor(playerState.oxygen)}
            icon="💨"
          />
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">
          <span className="section-icon">⚡</span>
          Decision Performance
        </h3>
        <div className="performance-info">
          <div className={`timeout-indicator ${getTimeoutUrgency(timeoutCount)}`}>
            <div className="timeout-header">
              <span className="timeout-icon">
                {timeoutCount === 0 ? '✅' : 
                 timeoutCount === 1 ? '⚠️' : 
                 timeoutCount === 2 ? '🚨' : '💀'}
              </span>
              <span className="timeout-label">Response Speed</span>
              <span className="timeout-status">{getTimeoutMessage(timeoutCount)}</span>
            </div>
            <div className="timeout-details">
              <span>Timeouts: {timeoutCount}</span>
              {timeoutCount > 0 && (
                <span className="timeout-warning">
                  {timeoutCount === 1 ? 'Improve decision speed' :
                   timeoutCount === 2 ? 'Speed critical for survival' :
                   'Hesitation is life-threatening'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">
          <span className="section-icon">💡</span>
          Quick Tips
        </h3>
        <div className="tips-container">
          <div className="tip-item">
            <span className="tip-icon">🔥</span>
            <span className="tip-text">Stay low to avoid smoke</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🚪</span>
            <span className="tip-text">Feel doors before opening</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📞</span>
            <span className="tip-text">Call 995 when safe</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🏃</span>
            <span className="tip-text">Don't use elevators</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSidebar;