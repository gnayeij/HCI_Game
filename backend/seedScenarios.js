const mongoose = require('mongoose');
const Scenario = require('./models/Scenario');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fire-safety-game';

const officeScenarioData = {
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
    },
    {
      id: 'hallway_smoky',
      title: 'Hallway - Heavy Smoke',
      description: 'You opened the door without checking and thick smoke rushes into your office. Your visibility is severely reduced and you\'re coughing. This was a dangerous mistake.',
      location: 'Hallway',
      environment: {
        smokeLevel: 60,
        fireSpread: 20,
        visibility: 30,
        temperature: 35
      },
      availableItems: [],
      decisions: [
        {
          id: 'retreat_office',
          text: 'Retreat back to your office and close the door',
          timeLimit: 10,
          consequences: { health: 0, visibility: 10 },
          nextNodeId: 'office_start',
          isCorrect: true,
          educationalNote: 'Good recovery! When smoke is too thick, retreat and find another way.'
        },
        {
          id: 'push_through',
          text: 'Push through the smoke to find the exit',
          timeLimit: 5,
          consequences: { health: -15, oxygen: -20 },
          nextNodeId: 'lost_in_smoke',
          isCorrect: false,
          educationalNote: 'Dangerous! Never push through heavy smoke - you can lose your way and succumb to smoke inhalation.'
        }
      ],
      isEnding: false
    },
    {
      id: 'lost_in_smoke',
      title: 'Lost in Heavy Smoke',
      description: 'You are now lost in the heavy smoke, disoriented and struggling to breathe. Your health is declining rapidly. This situation is becoming critical.',
      location: 'Hallway - Heavy Smoke',
      environment: {
        smokeLevel: 80,
        fireSpread: 30,
        visibility: 10,
        temperature: 40
      },
      availableItems: [],
      decisions: [],
      isEnding: true,
      endingType: 'failure'
    },
    {
      id: 'hallway_with_towel',
      title: 'Hallway - Protected with Towel',
      description: 'You carefully opened the door with a wet towel covering your nose and mouth. The smoke is present but more manageable with your protection. You can see people moving toward the emergency exits.',
      location: 'Hallway',
      environment: {
        smokeLevel: 20,
        fireSpread: 12,
        visibility: 80,
        temperature: 26
      },
      availableItems: [],
      decisions: [
        {
          id: 'follow_others_stairs',
          text: 'Follow other people toward the emergency stairwell',
          timeLimit: 10,
          consequences: { health: 2 },
          nextNodeId: 'stairwell_entry',
          isCorrect: true,
          educationalNote: 'Smart! Following others to safety while being protected is a good strategy.'
        },
        {
          id: 'help_colleague_towel',
          text: 'Offer to help a colleague who doesn\'t have protection',
          timeLimit: 15,
          consequences: { health: -2, oxygen: -3 },
          nextNodeId: 'helping_colleague',
          isCorrect: true,
          educationalNote: 'Noble! Helping others is important, though it does carry some risk.'
        }
      ],
      isEnding: false
    },
    {
      id: 'helping_colleague',
      title: 'Assisting Colleague',
      description: 'You\'re helping your elderly colleague navigate through the emergency. They\'re grateful for your assistance but moving slower than you could alone. You need to balance helping them with ensuring your own safety.',
      location: 'Hallway',
      environment: {
        smokeLevel: 30,
        fireSpread: 15,
        visibility: 70,
        temperature: 30
      },
      availableItems: [],
      decisions: [
        {
          id: 'continue_helping',
          text: 'Continue assisting them to the stairwell together',
          timeLimit: 20,
          consequences: { health: -5, oxygen: -10 },
          nextNodeId: 'stairwell_with_colleague',
          isCorrect: true,
          educationalNote: 'Compassionate choice! Helping others is important, even with personal risk.'
        },
        {
          id: 'find_help',
          text: 'Look for emergency personnel to help them',
          timeLimit: 15,
          consequences: { health: -2 },
          nextNodeId: 'emergency_help',
          isCorrect: true,
          educationalNote: 'Good thinking! Getting professional help is often the best approach.'
        }
      ],
      isEnding: false
    },
    {
      id: 'stairwell_with_colleague',
      title: 'Stairwell - Helping Others',
      description: 'You and your colleague have reached the stairwell together. The air is clearer here, and you can see other people helping each other evacuate. Emergency personnel are directing traffic flow.',
      location: 'Stairwell',
      environment: {
        smokeLevel: 8,
        fireSpread: 10,
        visibility: 90,
        temperature: 26
      },
      availableItems: [],
      decisions: [
        {
          id: 'evacuate_together',
          text: 'Evacuate together, taking your time',
          timeLimit: 10,
          consequences: { health: 0 },
          nextNodeId: 'group_evacuation',
          isCorrect: true,
          educationalNote: 'Perfect! Orderly evacuation while helping others is the ideal approach.'
        }
      ],
      isEnding: false
    },
    {
      id: 'group_evacuation',
      title: 'Successful Group Evacuation',
      description: 'You have successfully evacuated with your colleague! Both of you are safe at the assembly point. Emergency personnel commend your quick thinking and willingness to help others during the crisis.',
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
      id: 'emergency_help',
      title: 'Professional Assistance',
      description: 'You found emergency personnel who took over helping your colleague. This allowed you to evacuate quickly while ensuring they received proper assistance.',
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
          id: 'evacuate_quickly',
          text: 'Proceed to evacuate quickly now that help arrived',
          timeLimit: 10,
          consequences: { health: 2 },
          nextNodeId: 'successful_evacuation',
          isCorrect: true,
          educationalNote: 'Excellent decision-making! You helped while also ensuring professional care.'
        }
      ],
      isEnding: false
    },
    {
      id: 'calling_help',
      title: 'Calling Emergency Services',
      description: 'You\'ve called 911 and reported the fire. The dispatcher confirms that emergency services are already on scene and provides you with evacuation instructions. Now you need to focus on getting out safely.',
      location: 'Your Office',
      environment: {
        smokeLevel: 12,
        fireSpread: 8,
        visibility: 88,
        temperature: 24
      },
      availableItems: ['wet towel', 'flashlight'],
      decisions: [
        {
          id: 'follow_dispatcher_advice',
          text: 'Follow the dispatcher\'s evacuation instructions',
          timeLimit: 10,
          consequences: { health: 0 },
          nextNodeId: 'door_cool',
          isCorrect: true,
          educationalNote: 'Good! Following professional guidance during emergencies is always wise.'
        }
      ],
      isEnding: false
    },
    {
      id: 'wasted_time',
      title: 'Precious Time Lost',
      description: 'While gathering your belongings, the smoke has thickened and the fire has spread. You\'ve wasted valuable evacuation time and now face a more dangerous situation.',
      location: 'Your Office',
      environment: {
        smokeLevel: 25,
        fireSpread: 18,
        visibility: 70,
        temperature: 32
      },
      availableItems: ['wet towel'],
      decisions: [
        {
          id: 'abandon_items',
          text: 'Abandon the items and evacuate immediately',
          timeLimit: 10,
          consequences: { health: -5 },
          nextNodeId: 'hallway_assessment',
          isCorrect: true,
          educationalNote: 'Good recovery! Sometimes you must cut your losses and prioritize survival.'
        },
        {
          id: 'continue_gathering',
          text: 'Quickly grab just the most important items',
          timeLimit: 15,
          consequences: { health: -15, oxygen: -10 },
          nextNodeId: 'dangerous_situation',
          isCorrect: false,
          educationalNote: 'This is becoming very dangerous! Material possessions are never worth your life.'
        }
      ],
      isEnding: false
    },
    {
      id: 'dangerous_situation',
      title: 'Critical Danger Zone',
      description: 'Your continued delay has put you in serious danger. The smoke is now thick, visibility is poor, and you\'re running out of time. This is a life-threatening situation.',
      location: 'Your Office',
      environment: {
        smokeLevel: 50,
        fireSpread: 30,
        visibility: 40,
        temperature: 45
      },
      availableItems: [],
      decisions: [
        {
          id: 'emergency_escape',
          text: 'Drop everything and escape immediately using any means necessary',
          timeLimit: 8,
          consequences: { health: -10, oxygen: -15 },
          nextNodeId: 'last_chance_escape',
          isCorrect: true,
          educationalNote: 'This is your last chance! Every second matters now.'
        }
      ],
      isEnding: false
    },
    {
      id: 'last_chance_escape',
      title: 'Last Chance Evacuation',
      description: 'You barely make it out, having learned a crucial lesson about priorities during emergencies. You\'re injured and shaken, but alive.',
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

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing scenarios
    console.log('Clearing existing scenarios...');
    await Scenario.deleteMany({});

    // Insert the office scenario
    console.log('Inserting office building scenario...');
    const scenario = new Scenario(officeScenarioData);
    await scenario.save();

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Inserted scenario: "${scenario.title}"`);
    console.log(`🆔 Scenario ID: ${scenario._id}`);
    console.log(`📍 Total nodes: ${scenario.nodes.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();