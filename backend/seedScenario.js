const mongoose = require('mongoose');
const Scenario = require('./models/Scenario');
require('dotenv').config();

// Sample office building fire scenario
const officeBuildingScenario = {
  title: 'Office Building Fire Emergency',
  description: 'A fire has broken out on the 15th floor of your office building. Smoke is starting to fill the corridors and you need to evacuate immediately. Your decisions will determine your survival.',
  category: 'office',
  difficulty: 'medium',
  estimatedDuration: 300,
  learningObjectives: [
    'Proper evacuation procedures for high-rise buildings',
    'Decision-making under time pressure',
    'Understanding fire behavior and smoke spread',
    'Use of emergency exits and stairwells'
  ],
  startingNode: 'office_start',
  nodes: [
    {
      id: 'office_start',
      title: 'Your Office - 15th Floor',
      description: 'You are working at your desk when the fire alarm suddenly goes off. You can smell smoke coming from the hallway. Your office is on the 15th floor of a 20-story building. Through your window, you can see fire trucks arriving below.',
      location: 'Your Office',
      environment: {
        smokeLevel: 10,
        fireSpread: 5,
        visibility: 90,
        temperature: 22
      },
      availableItems: ['wet towel', 'flashlight'],
      decisions: [
        {
          id: 'check_hallway',
          text: 'Open the door to check the hallway situation immediately',
          timeLimit: 15,
          consequences: { health: -5, visibility: -10 },
          nextNodeId: 'hallway_smoky',
          isCorrect: false,
          educationalNote: 'Opening doors in a fire can let in smoke and heat. Always check doors by feeling them first.'
        },
        {
          id: 'feel_door',
          text: 'Feel the door with the back of your hand before opening',
          timeLimit: 15,
          consequences: { health: 0 },
          nextNodeId: 'door_cool',
          isCorrect: true,
          educationalNote: 'Correct! Always check doors for heat before opening during a fire.'
        },
        {
          id: 'call_911',
          text: 'Call 911 immediately before doing anything else',
          timeLimit: 10,
          consequences: { health: 0 },
          nextNodeId: 'calling_help',
          isCorrect: true,
          educationalNote: 'Good thinking! Alerting emergency services is always important, but in a high-rise, building security may have already called.'
        },
        {
          id: 'gather_items',
          text: 'Quickly gather important documents and personal items',
          timeLimit: 20,
          consequences: { health: -10, oxygen: -5 },
          nextNodeId: 'wasted_time',
          isCorrect: false,
          educationalNote: 'In a fire emergency, your life is more important than possessions. Every second counts in evacuation.'
        }
      ],
      isEnding: false
    },
    {
      id: 'door_cool',
      title: 'Office Door - Cool to Touch',
      description: 'The door feels cool to the touch. This is a good sign - there is likely no fire directly outside your door. You can hear people in the hallway, some shouting directions. The fire alarm is still blaring.',
      location: 'Your Office',
      environment: {
        smokeLevel: 15,
        fireSpread: 8,
        visibility: 85,
        temperature: 24
      },
      availableItems: [],
      decisions: [
        {
          id: 'open_door_carefully',
          text: 'Carefully open the door and look into the hallway',
          timeLimit: 10,
          consequences: { health: 0, visibility: -5 },
          nextNodeId: 'hallway_assessment',
          isCorrect: true,
          educationalNote: 'Good! Since the door was cool, it\'s safer to open it carefully.'
        },
        {
          id: 'stay_put',
          text: 'Stay in the office and wait for help to arrive',
          timeLimit: 5,
          consequences: { health: -5, oxygen: -10 },
          nextNodeId: 'trapped_office',
          isCorrect: false,
          educationalNote: 'Staying put is rarely the right choice in a fire. Evacuate immediately when possible.'
        },
        {
          id: 'get_wet_towel',
          text: 'Get the wet towel first, then open the door',
          timeLimit: 15,
          consequences: { health: 5, visibility: 0 },
          nextNodeId: 'hallway_with_towel',
          isCorrect: true,
          educationalNote: 'Excellent! A wet towel can help filter smoke and protect your airways.'
        }
      ],
      isEnding: false
    },
    {
      id: 'hallway_assessment',
      title: 'Hallway - Light Smoke',
      description: 'The hallway has light smoke, but visibility is still decent. You can see other people heading toward the stairwell exit. The elevator bank is to your right, and emergency stairs are to your left. The smoke seems to be coming from the far end of the hallway.',
      location: 'Hallway',
      environment: {
        smokeLevel: 25,
        fireSpread: 12,
        visibility: 75,
        temperature: 28
      },
      availableItems: [],
      decisions: [
        {
          id: 'take_elevator',
          text: 'Take the elevator down - it will be faster',
          timeLimit: 10,
          consequences: { health: -20, oxygen: -15 },
          nextNodeId: 'elevator_danger',
          isCorrect: false,
          educationalNote: 'Never use elevators during a fire! They can malfunction, trap you, or take you to the fire floor.'
        },
        {
          id: 'use_stairs',
          text: 'Head to the emergency stairwell immediately',
          timeLimit: 10,
          consequences: { health: 0 },
          nextNodeId: 'stairwell_entry',
          isCorrect: true,
          educationalNote: 'Correct! Stairs are the only safe way to evacuate during a fire.'
        },
        {
          id: 'help_others',
          text: 'Help an elderly colleague who seems confused',
          timeLimit: 20,
          consequences: { health: -5, oxygen: -5 },
          nextNodeId: 'helping_colleague',
          isCorrect: true,
          educationalNote: 'Good instinct! Helping others is important, but ensure your own safety first.'
        },
        {
          id: 'check_fire_source',
          text: 'Go toward the smoke to see how bad the fire is',
          timeLimit: 15,
          consequences: { health: -15, oxygen: -20, visibility: -25 },
          nextNodeId: 'dangerous_investigation',
          isCorrect: false,
          educationalNote: 'Never investigate a fire! This puts you in extreme danger. Evacuate immediately.'
        }
      ],
      isEnding: false
    },
    {
      id: 'stairwell_entry',
      title: 'Emergency Stairwell - 15th Floor',
      description: 'You enter the stairwell. It\'s much clearer here - the smoke hasn\'t penetrated as much. You can see other people calmly but quickly making their way down. The stairwell is well-lit and you can hear emergency instructions echoing from below.',
      location: 'Stairwell',
      environment: {
        smokeLevel: 5,
        fireSpread: 8,
        visibility: 95,
        temperature: 25
      },
      availableItems: [],
      decisions: [
        {
          id: 'walk_down_calmly',
          text: 'Walk down calmly, staying to the right',
          timeLimit: 10,
          consequences: { health: 5 },
          nextNodeId: 'successful_evacuation',
          isCorrect: true,
          educationalNote: 'Perfect! Staying calm and orderly prevents panic and accidents on stairs.'
        },
        {
          id: 'run_down_fast',
          text: 'Run down as fast as possible to get out quickly',
          timeLimit: 5,
          consequences: { health: -10 },
          nextNodeId: 'stairs_accident',
          isCorrect: false,
          educationalNote: 'Running on stairs during evacuation is dangerous and can cause falls and block others.'
        },
        {
          id: 'go_up_to_roof',
          text: 'Go up to the roof for helicopter rescue',
          timeLimit: 15,
          consequences: { health: -10, oxygen: -10 },
          nextNodeId: 'roof_danger',
          isCorrect: false,
          educationalNote: 'Going up toward a fire is almost always wrong. Evacuate down and out of the building.'
        }
      ],
      isEnding: false
    },
    {
      id: 'successful_evacuation',
      title: 'Ground Floor - Safety',
      description: 'You have successfully evacuated the building! You exit through the main lobby and are directed to the assembly point across the street by fire department personnel. You\'re safe, breathing fresh air, and can see the fire department working to control the situation.',
      location: 'Outside - Assembly Point',
      environment: {
        smokeLevel: 0,
        fireSpread: 0,
        visibility: 100,
        temperature: 20
      },
      availableItems: [],
      decisions: [],
      isEnding: true,
      endingType: 'success'
    },
    {
      id: 'elevator_danger',
      title: 'Elevator Shaft - Critical Danger',
      description: 'The elevator stops between floors and fills with smoke. You realize you\'ve made a critical error. The elevator doors won\'t open and smoke is getting thicker. This is a life-threatening situation.',
      location: 'Elevator - Between Floors',
      environment: {
        smokeLevel: 80,
        fireSpread: 25,
        visibility: 20,
        temperature: 45
      },
      availableItems: [],
      decisions: [],
      isEnding: true,
      endingType: 'failure'
    },
    {
      id: 'stairs_accident',
      title: 'Stairwell - Accident',
      description: 'While running down the stairs, you slip and fall, injuring your ankle. Other evacuees help you up, but you\'ve slowed the evacuation and put yourself at risk. You manage to continue down with assistance.',
      location: 'Stairwell',
      environment: {
        smokeLevel: 10,
        fireSpread: 15,
        visibility: 85,
        temperature: 28
      },
      availableItems: [],
      decisions: [
        {
          id: 'continue_with_help',
          text: 'Accept help and continue evacuating',
          timeLimit: 10,
          consequences: { health: -5 },
          nextNodeId: 'assisted_evacuation',
          isCorrect: true,
          educationalNote: 'Good! Accepting help when injured is important for everyone\'s safety.'
        }
      ],
      isEnding: false
    },
    {
      id: 'assisted_evacuation',
      title: 'Ground Floor - Injured but Safe',
      description: 'With help from other evacuees, you make it safely out of the building. Paramedics immediately attend to your ankle injury. You\'re alive and safe, though injured. This could have been avoided by walking calmly instead of running.',
      location: 'Outside - Medical Area',
      environment: {
        smokeLevel: 0,
        fireSpread: 0,
        visibility: 100,
        temperature: 20
      },
      availableItems: [],
      decisions: [],
      isEnding: true,
      endingType: 'partial'
    }
  ],
  metadata: {
    version: '1.0.0',
    tags: ['office', 'high-rise', 'evacuation', 'decision-making'],
    isPublished: true,
    playCount: 0,
    averageRating: 0,
    averageCompletionTime: 0
  }
};

// Connect to MongoDB and create the scenario
async function seedScenario() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fire-safety-game');
    console.log('Connected to MongoDB');

    // Check if scenario already exists
    const existingScenario = await Scenario.findOne({ title: officeBuildingScenario.title });
    
    if (existingScenario) {
      console.log('Scenario already exists, updating...');
      await Scenario.findByIdAndUpdate(existingScenario._id, officeBuildingScenario);
      console.log('Scenario updated successfully');
    } else {
      console.log('Creating new scenario...');
      const scenario = new Scenario(officeBuildingScenario);
      await scenario.save();
      console.log('Scenario created successfully');
    }

    console.log('Seed data complete');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding scenario:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedScenario();
}

module.exports = { officeBuildingScenario, seedScenario };