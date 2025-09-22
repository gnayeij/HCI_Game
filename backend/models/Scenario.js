const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  timeLimit: { type: Number, default: 30 }, // seconds
  consequences: {
    health: { type: Number, default: 0 }, // -100 to 100
    oxygen: { type: Number, default: 0 }, // -100 to 100
    visibility: { type: Number, default: 0 }, // -100 to 100
    safety: { type: Number, default: 0 } // -100 to 100
  },
  nextNodeId: { type: String }, // null for ending nodes
  isCorrect: { type: Boolean, default: false },
  educationalNote: String, // Explanation of why this choice is good/bad
  requiredItems: [String] // Items needed to make this choice
});

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: String,
  description: { type: String, required: true },
  location: String,
  environment: {
    smokeLevel: { type: Number, min: 0, max: 100, default: 0 },
    fireSpread: { type: Number, min: 0, max: 100, default: 0 },
    visibility: { type: Number, min: 0, max: 100, default: 100 },
    temperature: { type: Number, default: 20 } // Celsius
  },
  availableItems: [String], // Items that can be found in this location
  decisions: [decisionSchema],
  isEnding: { type: Boolean, default: false },
  endingType: { 
    type: String, 
    enum: ['success', 'failure', 'partial'], 
    required: function() { return this.isEnding; }
  }
});

const scenarioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['office', 'residential', 'school', 'hospital', 'retail', 'industrial'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: { type: Number, default: 300 }, // seconds
  learningObjectives: [String],
  startingNode: { type: String, required: true },
  nodes: [nodeSchema],
  metadata: {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    version: { type: String, default: '1.0.0' },
    tags: [String],
    isPublished: { type: Boolean, default: false },
    playCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for better query performance
scenarioSchema.index({ category: 1, difficulty: 1 });
scenarioSchema.index({ 'metadata.isPublished': 1 });

module.exports = mongoose.model('Scenario', scenarioSchema);