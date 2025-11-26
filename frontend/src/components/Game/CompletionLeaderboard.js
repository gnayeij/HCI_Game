import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './CompletionLeaderboard.css';

const CompletionLeaderboard = ({ playerScore }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    fetchLeaderboardAndComparison();
  }, []);

  const fetchLeaderboardAndComparison = async () => {
    try {
      setLoading(true);
      // Fetch top 5 players for display
      const response = await usersAPI.getLeaderboard({ sortBy: 'highScore', limit: 50 });
      const leaderboardData = response.data.leaderboard || [];
      setLeaderboard(leaderboardData.slice(0, 5)); // Show only top 5

      // Find current user's position and calculate comparison
      if (user && playerScore?.score?.total) {
        calculateComparison(leaderboardData, playerScore.score.total);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateComparison = (leaderboardData, currentScore) => {
    // Find user's highest score from leaderboard
    const userEntry = leaderboardData.find(entry => entry.username === user.username);
    const userHighScore = userEntry?.highScore || currentScore;

    // Find the next player ahead
    let nextPlayer = null;
    let playerRank = leaderboardData.length + 1; // Default to last

    // Find all players with higher scores
    const playersAhead = leaderboardData.filter(entry => entry.highScore > userHighScore);
    
    if (playersAhead.length > 0) {
      // Sort by score (closest to user's score first)
      playersAhead.sort((a, b) => a.highScore - b.highScore);
      nextPlayer = playersAhead[0];
      playerRank = playersAhead.length + 1; // User's rank is number of players ahead + 1
    } else {
      // User is #1!
      playerRank = 1;
    }

    // Calculate score difference
    const scoreDifference = nextPlayer 
      ? nextPlayer.highScore - userHighScore
      : 0;

    // Generate motivational message
    let message = '';
    let encouragement = '';
    
    if (playerRank === 1) {
      message = "🎉 You're the TOP PLAYER!";
      encouragement = "Amazing! You've achieved the highest score. Can you beat your own record?";
    } else if (scoreDifference <= 10) {
      message = `So close! Just ${scoreDifference} points behind ${nextPlayer.username}!`;
      encouragement = "You're almost there! One more great run and you'll overtake them!";
    } else if (scoreDifference <= 30) {
      message = `${scoreDifference} points behind ${nextPlayer.username}`;
      encouragement = "You can close this gap! Focus on quick decisions and maintaining your health!";
    } else if (scoreDifference <= 50) {
      message = `Catch up to ${nextPlayer.username} - ${scoreDifference} points to go!`;
      encouragement = "Keep practicing! Every scenario teaches you new fire safety skills.";
    } else {
      message = `${nextPlayer.username} is ahead with ${nextPlayer.highScore} points`;
      encouragement = "Don't give up! Master the scenarios and you'll climb the ranks!";
    }

    setComparison({
      playerRank,
      nextPlayer,
      scoreDifference,
      userHighScore,
      message,
      encouragement,
      isTopPlayer: playerRank === 1
    });
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="completion-leaderboard loading">
        <div className="loading-spinner-small"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="completion-leaderboard">
      {/* Motivational Comparison Section */}
      {comparison && (
        <div className={`score-comparison ${comparison.isTopPlayer ? 'top-player' : ''}`}>
          <div className="comparison-header">
            <span className="rank-display">{getRankBadge(comparison.playerRank)}</span>
            <h3>Your Ranking</h3>
          </div>
          
          <div className="comparison-message">
            <p className="primary-message">{comparison.message}</p>
            <p className="encouragement">{comparison.encouragement}</p>
          </div>

          {!comparison.isTopPlayer && comparison.nextPlayer && (
            <div className="score-gap-visual">
              <div className="gap-container">
                <div className="player-marker your-score">
                  <span className="marker-label">You</span>
                  <span className="marker-score">{comparison.userHighScore}</span>
                </div>
                <div className="gap-bar">
                  <div 
                    className="gap-fill" 
                    style={{ 
                      width: `${Math.min((comparison.scoreDifference / 100) * 100, 100)}%` 
                    }}
                  >
                    <span className="gap-points">{comparison.scoreDifference} pts</span>
                  </div>
                </div>
                <div className="player-marker next-player">
                  <span className="marker-label">{comparison.nextPlayer.username}</span>
                  <span className="marker-score">{comparison.nextPlayer.highScore}</span>
                </div>
              </div>
            </div>
          )}

          <div className="challenge-cta">
            <button className="challenge-btn" onClick={() => window.location.reload()}>
              🔥 Play Again & Climb Higher!
            </button>
          </div>
        </div>
      )}

      {/* Top 5 Leaderboard */}
      <div className="mini-leaderboard">
        <h4>🏆 Top 5 Players</h4>
        <div className="leaderboard-list">
          {leaderboard.map((entry) => {
            const isCurrentUser = user && entry.username === user.username;
            return (
              <div 
                key={entry._id} 
                className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
              >
                <span className="item-rank">{getRankBadge(entry.rank)}</span>
                <span className="item-name">
                  {entry.username}
                  {isCurrentUser && <span className="you-badge">You</span>}
                </span>
                <span className="item-score">{entry.highScore}</span>
              </div>
            );
          })}
        </div>
        <div className="leaderboard-footer">
          <p>Want to see the full rankings?</p>
          <button 
            className="view-full-btn" 
            onClick={() => window.location.href = '/leaderboard'}
          >
            View Full Leaderboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionLeaderboard;
