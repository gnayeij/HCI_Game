import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Profile Settings Form
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    language: 'english'
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        language: user.preferences?.language || 'english'
      });
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await usersAPI.updateProfile(profileForm);
      
      // Update user in context
      updateUser(response.data.user);
      
      showNotification('Account Settings Saved!', 'success');
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Check if new password and confirm password match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await usersAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      showNotification('Password Changed!', 'success');
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      
      if (errorMessage.includes('incorrect') || errorMessage.includes('Current password')) {
        showNotification('Wrong Current Password', 'error');
      } else {
        showNotification(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="profile-wrapper">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <h2>Settings</h2>
          <nav className="profile-nav">
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">👤</span>
              Profile Settings
            </button>
            <button
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <span className="nav-icon">🔒</span>
              Password
            </button>
          </nav>
        </div>

        {/* Right Content */}
        <div className="profile-content">
          {activeTab === 'settings' && (
            <div className="settings-panel">
              <h2>Profile Settings</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <select
                    id="language"
                    name="language"
                    value={profileForm.language}
                    onChange={handleProfileChange}
                  >
                    <option value="english">English</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Apply Settings'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="password-panel">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;