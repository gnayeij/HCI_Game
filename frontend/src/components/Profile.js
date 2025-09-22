import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>Manage your account and training progress</p>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <span>{user?.username}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>First Name</label>
                <span>{user?.profile?.firstName || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <span>{user?.profile?.lastName || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Game Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{user?.gameStats?.totalGamesPlayed || 0}</div>
                <div className="stat-label">Games Played</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{user?.gameStats?.scenariosCompleted?.length || 0}</div>
                <div className="stat-label">Scenarios Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{user?.gameStats?.currentLevel || 1}</div>
                <div className="stat-label">Current Level</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {user?.gameStats?.totalTimeSpent 
                    ? Math.round(user.gameStats.totalTimeSpent / 60) 
                    : 0}m
                </div>
                <div className="stat-label">Time Spent</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label>Difficulty Level</label>
                <span className={`badge ${user?.preferences?.difficultyLevel}`}>
                  {user?.preferences?.difficultyLevel || 'medium'}
                </span>
              </div>
              <div className="preference-item">
                <label>Sound Effects</label>
                <span className={`badge ${user?.preferences?.soundEnabled ? 'enabled' : 'disabled'}`}>
                  {user?.preferences?.soundEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="preference-item">
                <label>Timer Display</label>
                <span className={`badge ${user?.preferences?.timerEnabled ? 'enabled' : 'disabled'}`}>
                  {user?.preferences?.timerEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="preference-item">
                <label>Hints</label>
                <span className={`badge ${user?.preferences?.hints ? 'enabled' : 'disabled'}`}>
                  {user?.preferences?.hints ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;