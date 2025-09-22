const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scenario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Scenario', 
    required: true 
  },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  isCompleted: { type: Boolean, default: false },
  currentNodeId: { type: String, required: true },
  playerState: {
    health: { type: Number, default: 100, min: 0, max: 100 },
    oxygen: { type: Number, default: 100, min: 0, max: 100 },
    visibility: { type: Number, default: 100, min: 0, max: 100 },
    inventory: [String],
    location: String
  },
  decisions: [{
    nodeId: String,
    decisionId: String,
    timeTaken: Number, // seconds
    timestamp: { type: Date, default: Date.now },
    wasCorrect: Boolean
  }],
  finalOutcome: {
    type: String,
    enum: ['success', 'failure', 'partial', 'abandoned']
  },
  score: {
    total: { type: Number, default: 0 },
    timeBonus: { type: Number, default: 0 },
    safetyBonus: { type: Number, default: 0 },
    knowledgeBonus: { type: Number, default: 0 }
  },
  completionTime: Number, // total seconds
  hintsUsed: { type: Number, default: 0 },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    difficulty: { type: String, enum: ['too-easy', 'just-right', 'too-hard'] }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
gameSessionSchema.index({ user: 1, scenario: 1 });
gameSessionSchema.index({ user: 1, isCompleted: 1 });
gameSessionSchema.index({ scenario: 1, isCompleted: 1 });

// Virtual for session duration
gameSessionSchema.virtual('duration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000); // seconds
  }
  return null;
});

// Method to calculate score
gameSessionSchema.methods.calculateScore = function() {
  if (!this.isCompleted || !this.completionTime) return 0;
  
  const baseScore = 100;
  const timeBonus = Math.max(0, 300 - this.completionTime) * 0.5; // Bonus for speed
  const safetyBonus = this.playerState.health * 0.3; // Bonus for staying healthy
  const decisionAccuracy = this.decisions.filter(d => d.wasCorrect).length / this.decisions.length;
  const knowledgeBonus = decisionAccuracy * 50;
  
  this.score = {
    total: Math.round(baseScore + timeBonus + safetyBonus + knowledgeBonus),
    timeBonus: Math.round(timeBonus),
    safetyBonus: Math.round(safetyBonus),
    knowledgeBonus: Math.round(knowledgeBonus)
  };
  
  return this.score.total;
};

module.exports = mongoose.model('GameSession', gameSessionSchema);