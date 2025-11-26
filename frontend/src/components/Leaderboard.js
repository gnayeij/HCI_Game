import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('highScore');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, limit]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersAPI.getLeaderboard({ sortBy, limit });
      setLeaderboard(response.data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top fire safety champions and their achievements</p>
      </div>

      <div className="leaderboard-controls">
        <div className="control-group">
          <label>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="highScore">High Score</option>
            <option value="avgScore">Average Score</option>
            <option value="totalGames">Games Played</option>
          </select>
        </div>

        <div className="control-group">
          <label>Show:</label>
          <select 
            value={limit} 
            onChange={(e) => setLimit(e.target.value)}
            className="limit-select"
          >
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
        </div>

        <button onClick={fetchLeaderboard} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchLeaderboard} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <p>🎮 No scores yet. Be the first to play and claim the top spot!</p>
        </div>
      ) : (
        <div className="leaderboard-content">
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>High Score</th>
                  <th>Avg Score</th>
                  <th>Games Played</th>
                  <th>Best Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr 
                    key={entry._id} 
                    className={`leaderboard-row rank-${entry.rank <= 3 ? entry.rank : 'other'}`}
                  >
                    <td className="rank-cell">
                      <span className="rank-badge">{getRankBadge(entry.rank)}</span>
                    </td>
                    <td className="player-cell">
                      <span className="player-name">{entry.username}</span>
                    </td>
                    <td className="score-cell">
                      <span className="high-score">{entry.highScore}</span>
                    </td>
                    <td className="score-cell">
                      <span className="avg-score">{entry.averageScore}</span>
                    </td>
                    <td className="games-cell">
                      <span className="games-count">{entry.totalGames}</span>
                    </td>
                    <td className="time-cell">
                      <span className="best-time">{formatTime(entry.bestTime)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="leaderboard-footer">
            <p>Showing {leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'}</p>
            <p>Compete in scenarios to earn your place on the leaderboard!</p>
          </div>
        </div>
      )}

      <div className="leaderboard-info">
        <h3>📊 How Scoring Works</h3>
        <div className="scoring-details">
          <div className="scoring-item">
            <span className="scoring-icon">⚡</span>
            <div className="scoring-text">
              <strong>Time Bonus</strong>
              <p>Complete scenarios quickly for bonus points</p>
            </div>
          </div>
          <div className="scoring-item">
            <span className="scoring-icon">❤️</span>
            <div className="scoring-text">
              <strong>Safety Bonus</strong>
              <p>Maintain high health for additional points</p>
            </div>
          </div>
          <div className="scoring-item">
            <span className="scoring-icon">🧠</span>
            <div className="scoring-text">
              <strong>Knowledge Bonus</strong>
              <p>Make correct decisions to maximize your score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
