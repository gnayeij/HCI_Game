import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import GameBoard from './components/Game/GameBoard';
import ScenariosList from './components/Game/ScenariosList';
import DifficultySelection from './components/Game/DifficultySelection';
import Profile from './components/Profile';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/scenarios" 
            element={
              <ProtectedRoute>
                <ScenariosList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/game/:scenarioId/difficulty" 
            element={
              <ProtectedRoute>
                <DifficultySelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/game/:scenarioId/:difficulty" 
            element={
              <ProtectedRoute>
                <GameBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
