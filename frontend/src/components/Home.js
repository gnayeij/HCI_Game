import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Fire Safety Emergency Trainer</h1>
          <p className="hero-subtitle">
            Master critical thinking and decision-making skills for fire emergencies
          </p>
          <p className="hero-description">
            Experience realistic fire emergency scenarios in a safe environment. 
            Make time-critical decisions, learn from consequences, and develop 
            life-saving skills through interactive gameplay.
          </p>
          
          <div className="cta-buttons">
            {isAuthenticated ? (
              <Link to="/scenarios" className="cta-button primary">
                Start Training
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  Get Started
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Train with Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Time-Based Decisions</h3>
              <p>Experience the pressure of real emergencies with timed decision making</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Critical Thinking</h3>
              <p>Develop logical reasoning skills for emergency situations</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Multiple Scenarios</h3>
              <p>Train in various environments: offices, homes, schools, and more</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your improvement and learn from each scenario</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Cross-Platform</h3>
              <p>Train anywhere on PC, tablet, or mobile devices</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Educational</h3>
              <p>Learn real fire safety principles and best practices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;