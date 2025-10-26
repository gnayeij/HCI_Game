import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DifficultySelection.css';

const DifficultySelection = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  const difficulties = [
    {
      level: 'easy',
      name: 'Easy',
      icon: '🌱',
      decisionTime: 30,
      description: 'Take your time to think through each decision',
      color: 'green',
      features: [
        '30 seconds per decision',
        'Perfect for beginners',
        'Focus on learning fire safety basics'
      ]
    },
    {
      level: 'medium',
      name: 'Medium',
      icon: '⚡',
      decisionTime: 20,
      description: 'Balanced challenge with moderate time pressure',
      color: 'yellow',
      features: [
        '20 seconds per decision',
        'Recommended for most users',
        'Realistic emergency response time'
      ]
    },
    {
      level: 'hard',
      name: 'Hard',
      icon: '🔥',
      decisionTime: 10,
      description: 'Quick thinking under extreme pressure',
      color: 'red',
      features: [
        '10 seconds per decision',
        'For experienced players',
        'Simulates high-stress emergency scenarios'
      ]
    }
  ];

  const handleDifficultySelect = (difficulty) => {
    navigate(`/game/${scenarioId}/${difficulty}`);
  };

  const handleBack = () => {
    navigate('/scenarios');
  };

  return (
    <div className="difficulty-selection-container">
      <div className="difficulty-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Scenarios
        </button>
        <h1>Select Difficulty</h1>
        <p>Choose your challenge level. This will determine your decision time.</p>
      </div>

      <div className="difficulty-grid">
        {difficulties.map((difficulty) => (
          <div 
            key={difficulty.level}
            className={`difficulty-card ${difficulty.color}`}
            onClick={() => handleDifficultySelect(difficulty.level)}
          >
            <div className="difficulty-icon">{difficulty.icon}</div>
            <h2>{difficulty.name}</h2>
            <div className="decision-time">
              <span className="time-value">{difficulty.decisionTime}s</span>
              <span className="time-label">per decision</span>
            </div>
            <p className="difficulty-description">{difficulty.description}</p>
            <ul className="difficulty-features">
              {difficulty.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
            <button className="select-button">
              Select {difficulty.name}
            </button>
          </div>
        ))}
      </div>

      <div className="difficulty-info">
        <div className="info-box">
          <h3>💡 Tip</h3>
          <p>
            Start with Easy mode if you're new to fire safety training. 
            You can always challenge yourself with harder difficulties later!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelection;
