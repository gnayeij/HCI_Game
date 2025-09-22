import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { scenariosAPI } from '../../services/api';
import './ScenariosList.css';

const ScenariosList = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated } = useAuth();

  console.log('ScenariosList - Auth state:', { user, token: token ? 'Present' : 'Missing', isAuthenticated });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      console.log('Fetching scenarios...');
      const response = await scenariosAPI.getScenarios();
      console.log('Scenarios response:', response);
      setScenarios(response.data.scenarios);
      setError(null);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      console.error('Error response:', err.response);
      setError('Failed to load scenarios. Please try again.');
      // Fallback to placeholder data if API fails
      setScenarios([
        {
          _id: '1', // Use the dev endpoint ID
          title: 'Office Building Fire',
          description: 'Navigate through a multi-story office building during a fire emergency. Learn to identify exit routes and make critical decisions under pressure.',
          category: 'office',
          difficulty: 'medium',
          estimatedDuration: 300,
          learningObjectives: ['Exit route planning', 'Elevator safety', 'Smoke behavior'],
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'office': return '🏢';
      case 'residential': return '🏠';
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'retail': return '🏪';
      case 'industrial': return '🏭';
      default: return '🔥';
    }
  };

  return (
    <div className="scenarios-container">
      <div className="scenarios-header">
        <h1>Fire Safety Training Scenarios</h1>
        <p>Choose a scenario to start your emergency preparedness training</p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">Loading scenarios...</div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchScenarios} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="scenarios-grid">
        {scenarios.map((scenario) => (
          <div key={scenario._id} className="scenario-card">
            <div className="scenario-header">
              <div className="scenario-icon">
                {getCategoryIcon(scenario.category)}
              </div>
              <div className="scenario-meta">
                <span className={`difficulty-badge ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty}
                </span>
                <span className="duration">
                  {Math.round(scenario.estimatedDuration / 60)} min
                </span>
              </div>
            </div>

            <div className="scenario-content">
              <h3>{scenario.title}</h3>
              <p>{scenario.description}</p>

              <div className="learning-objectives">
                <h4>Learning Objectives:</h4>
                <ul>
                  {scenario.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="scenario-footer">
              <Link 
                to={`/game/${scenario._id}`} 
                className="start-button"
              >
                Start Training
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="scenarios-info">
        <div className="info-card">
          <h3>🎯 How It Works</h3>
          <p>
            Each scenario presents you with realistic fire emergency situations. 
            You'll need to make quick decisions under time pressure to safely evacuate.
          </p>
        </div>
        
        <div className="info-card">
          <h3>⏱️ Time Pressure</h3>
          <p>
            Real emergencies don't wait. Our scenarios include realistic time constraints 
            to help you practice making critical decisions quickly.
          </p>
        </div>
        
        <div className="info-card">
          <h3>📊 Learn & Improve</h3>
          <p>
            After each scenario, you'll receive feedback on your decisions and 
            learn the fire safety principles behind each choice.
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ScenariosList;