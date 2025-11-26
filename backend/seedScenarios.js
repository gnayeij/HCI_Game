const mongoose = require('mongoose');
const Scenario = require('./models/Scenario');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fire-safety-game';

const universityScenarioData = {
  title: 'University Science Lab Fire Emergency',
  description: 'A chemical fire has broken out in the university science building during your afternoon lab session. The fire started in a nearby chemistry lab and is spreading quickly. You must make critical decisions to evacuate safely from this complex academic building.',
  category: 'school',
  difficulty: 'medium',
  estimatedDuration: 320,
  learningObjectives: [
    'Safe evacuation from educational facilities',
    'Handling chemical fire emergencies',
    'Understanding fire alarm protocols in schools',
    'Assisting others during emergencies in crowded spaces',
    'Proper use of fire safety equipment'
  ],
  startingNode: 'uni_lab_start',
  nodes: [
    {
      id: 'uni_lab_start',
      title: 'Science Lab - 3rd Floor',
      description: 'You\'re in the biology lab on the 3rd floor working on your research project when the fire alarm goes off. You can hear panicked voices from the hallway, and through the door window, you see smoke beginning to fill the corridor. Other students in your lab are looking confused and scared.',
      location: 'Biology Lab',
      environment: {
        smokeLevel: 5,
        fireSpread: 8,
        visibility: 95,
        temperature: 22
      },
      availableItems: ['fire extinguisher', 'lab coat', 'water bottle'],
      decisions: [
        {
          id: 'immediate_exit',
          text: 'Lead the group to exit the lab immediately through the main door',
          timeLimit: 10,
          consequences: { health: -3, visibility: -5 },
          nextNodeId: 'hallway_crowded',
          isCorrect: true,
          educationalNote: 'Good instinct! Quick evacuation is important, though you should still check the door first.'
        },
        {
          id: 'check_door_first',
          text: 'Check the door for heat before opening and prepare the group',
          timeLimit: 15,
          consequences: { health: 0 },
          nextNodeId: 'door_check_safe',
          isCorrect: true,
          educationalNote: 'Excellent! Always check doors before opening in a fire situation.'
        },
        {
          id: 'use_fire_extinguisher',
          text: 'Grab the fire extinguisher and try to fight the fire',
          timeLimit: 20,
          consequences: { health: -15, oxygen: -10 },
          nextNodeId: 'extinguisher_danger',
          isCorrect: false,
          educationalNote: 'Only trained personnel should fight chemical fires. Evacuate immediately!'
        },
        {
          id: 'wait_for_instructions',
          text: 'Wait in the lab for official instructions from staff',
          timeLimit: 5,
          consequences: { health: -5, oxygen: -8 },
          nextNodeId: 'dangerous_delay',
          isCorrect: false,
          educationalNote: 'Never wait during a fire alarm! Evacuate immediately when it\'s safe to do so.'
        }
      ],
      isEnding: false
    },
    {
      id: 'door_check_safe',
      title: 'Lab Door - Safe to Exit',
      description: 'The door is cool to touch. You organize the other students in your lab - about 8 people total. Everyone is looking to you for guidance. The smoke in the hallway is visible but not too thick yet.',
      location: 'Biology Lab',
      environment: {
        smokeLevel: 8,
        fireSpread: 10,
        visibility: 90,
        temperature: 24
      },
      availableItems: ['lab coat', 'water bottle'],
      decisions: [
        {
          id: 'wet_cloth_protection',
          text: 'Have everyone wet cloth (lab coats/towels) to cover their faces',
          timeLimit: 20,
          consequences: { health: 5 },
          nextNodeId: 'prepared_group',
          isCorrect: true,
          educationalNote: 'Excellent leadership! Wet cloth helps filter smoke and protect airways.'
        },
        {
          id: 'quick_group_exit',
          text: 'Lead everyone out quickly without preparation',
          timeLimit: 10,
          consequences: { health: -2, oxygen: -5 },
          nextNodeId: 'hallway_crowded',
          isCorrect: false,
          educationalNote: 'While speed is important, quick preparation can make a big difference in smoke.'
        },
        {
          id: 'designate_buddy_system',
          text: 'Set up a buddy system before leaving',
          timeLimit: 15,
          consequences: { health: 2 },
          nextNodeId: 'organized_evacuation',
          isCorrect: true,
          educationalNote: 'Great thinking! Buddy systems ensure no one gets left behind.'
        }
      ],
      isEnding: false
    },
    {
      id: 'prepared_group',
      title: 'Prepared for Evacuation',
      description: 'Your group is now prepared with wet cloth over faces. Everyone seems calmer with your organized approach. You can see the hallway through the door - it\'s crowded with other students evacuating.',
      location: 'Biology Lab Exit',
      environment: {
        smokeLevel: 12,
        fireSpread: 12,
        visibility: 85,
        temperature: 26
      },
      availableItems: [],
      decisions: [
        {
          id: 'lead_to_stairwell',
          text: 'Lead the group to the nearest emergency stairwell',
          timeLimit: 10,
          consequences: { health: 0 },
          nextNodeId: 'stairwell_approach',
          isCorrect: true,
          educationalNote: 'Correct! Emergency stairs are the safest evacuation route.'
        },
        {
          id: 'check_alternate_exits',
          text: 'Look for less crowded alternative exits first',
          timeLimit: 15,
          consequences: { health: -3, oxygen: -5 },
          nextNodeId: 'alternate_route',
          isCorrect: false,
          educationalNote: 'In a fire, use the nearest safe exit. Don\'t waste time looking for alternatives.'
        }
      ],
      isEnding: false
    },
    {
      id: 'organized_evacuation',
      title: 'Buddy System Established',
      description: 'Everyone has a buddy to stick with during evacuation. You\'ve paired stronger students with those who seem more anxious. This organization will help ensure everyone gets out safely.',
      location: 'Biology Lab',
      environment: {
        smokeLevel: 10,
        fireSpread: 11,
        visibility: 88,
        temperature: 25
      },
      availableItems: [],
      decisions: [
        {
          id: 'proceed_organized',
          text: 'Proceed to stairwell in organized pairs',
          timeLimit: 10,
          consequences: { health: 3 },
          nextNodeId: 'stairwell_approach',
          isCorrect: true,
          educationalNote: 'Perfect! Organization and teamwork save lives in emergencies.'
        }
      ],
      isEnding: false
    },
    {
      id: 'hallway_crowded',
      title: 'Crowded Hallway - 3rd Floor',
      description: 'The hallway is packed with students trying to evacuate. Some are panicking, others are taking photos. Smoke is getting thicker and you can hear the fire alarm blaring continuously. The crowd is moving slowly toward the stairwell.',
      location: 'Hallway',
      environment: {
        smokeLevel: 25,
        fireSpread: 15,
        visibility: 70,
        temperature: 30
      },
      availableItems: [],
      decisions: [
        {
          id: 'join_crowd_calmly',
          text: 'Join the crowd and move calmly toward the stairwell',
          timeLimit: 10,
          consequences: { health: -2 },
          nextNodeId: 'stairwell_approach',
          isCorrect: true,
          educationalNote: 'Good! Stay calm in crowds to prevent panic and stampedes.'
        },
        {
          id: 'push_through_crowd',
          text: 'Push through the crowd to get out faster',
          timeLimit: 5,
          consequences: { health: -8, oxygen: -5 },
          nextNodeId: 'crowd_accident',
          isCorrect: false,
          educationalNote: 'Dangerous! Pushing in crowds can cause stampedes and injuries.'
        },
        {
          id: 'help_calm_others',
          text: 'Help calm panicking students while moving',
          timeLimit: 15,
          consequences: { health: -3, oxygen: -3 },
          nextNodeId: 'calming_influence',
          isCorrect: true,
          educationalNote: 'Noble! Helping prevent panic improves everyone\'s safety.'
        },
        {
          id: 'use_elevator_crowd',
          text: 'Take the elevator to avoid the crowd',
          timeLimit: 8,
          consequences: { health: -25, oxygen: -20 },
          nextNodeId: 'elevator_trap',
          isCorrect: false,
          educationalNote: 'Never use elevators in a fire! They can trap you or take you to the fire floor.'
        }
      ],
      isEnding: false
    },
    {
      id: 'stairwell_approach',
      title: 'Emergency Stairwell Entrance',
      description: 'You\'ve reached the stairwell entrance. The air is clearer here as the stairwell is pressurized. You can see students moving down in an orderly fashion. Emergency lighting is on and exit signs are clearly visible.',
      location: 'Stairwell - 3rd Floor',
      environment: {
        smokeLevel: 8,
        fireSpread: 10,
        visibility: 92,
        temperature: 24
      },
      availableItems: [],
      decisions: [
        {
          id: 'descend_orderly',
          text: 'Descend the stairs in an orderly manner, staying to the right',
          timeLimit: 10,
          consequences: { health: 3 },
          nextNodeId: 'stairwell_descent',
          isCorrect: true,
          educationalNote: 'Perfect! Orderly evacuation prevents accidents and helps emergency responders.'
        },
        {
          id: 'hurry_down_stairs',
          text: 'Hurry down the stairs quickly, taking two at a time',
          timeLimit: 5,
          consequences: { health: -12 },
          nextNodeId: 'stair_injury',
          isCorrect: false,
          educationalNote: 'Rushing on stairs is dangerous and can cause falls and injuries.'
        },
        {
          id: 'check_for_stragglers',
          text: 'Quickly check if anyone needs help before descending',
          timeLimit: 15,
          consequences: { health: -2, oxygen: -3 },
          nextNodeId: 'helping_student',
          isCorrect: true,
          educationalNote: 'Compassionate! Helping others is good, but be quick about it.'
        }
      ],
      isEnding: false
    },
    {
      id: 'stairwell_descent',
      title: 'Descending Stairwell',
      description: 'You\'re making steady progress down the stairwell. The crowd is moving well, and you can hear emergency personnel coordinating below. You\'re on the 2nd floor now, almost to ground level.',
      location: 'Stairwell - 2nd Floor',
      environment: {
        smokeLevel: 5,
        fireSpread: 8,
        visibility: 95,
        temperature: 23
      },
      availableItems: [],
      decisions: [
        {
          id: 'continue_descent',
          text: 'Continue descending to ground floor and exit',
          timeLimit: 10,
          consequences: { health: 5 },
          nextNodeId: 'successful_evacuation_uni',
          isCorrect: true,
          educationalNote: 'Excellent! Continue until you\'re completely out of the building.'
        },
        {
          id: 'exit_second_floor',
          text: 'Exit on the 2nd floor - it\'s closer',
          timeLimit: 8,
          consequences: { health: -5 },
          nextNodeId: 'second_floor_mistake',
          isCorrect: false,
          educationalNote: 'Don\'t leave the stairwell until you reach the ground floor unless directed by personnel.'
        }
      ],
      isEnding: false
    },
    {
      id: 'successful_evacuation_uni',
      title: 'Campus Grounds - Assembly Point',
      description: 'You\'ve successfully evacuated! You\'re at the designated assembly point on the campus lawn. Emergency services are actively fighting the fire, and university staff are taking attendance to ensure everyone is accounted for. You\'re safe, and your quick, calm decisions helped others evacuate safely too.',
      location: 'Campus Assembly Point',
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
      id: 'helping_student',
      title: 'Assisting Fellow Student',
      description: 'You found a student who twisted their ankle in the initial rush. They need help getting down the stairs. Emergency personnel haven\'t reached this floor yet.',
      location: 'Stairwell - 3rd Floor',
      environment: {
        smokeLevel: 12,
        fireSpread: 12,
        visibility: 85,
        temperature: 26
      },
      availableItems: [],
      decisions: [
        {
          id: 'support_student',
          text: 'Support the injured student and help them down slowly',
          timeLimit: 20,
          consequences: { health: -3, oxygen: -5 },
          nextNodeId: 'assisted_descent',
          isCorrect: true,
          educationalNote: 'Commendable! Helping injured people is important for their survival.'
        },
        {
          id: 'call_for_help',
          text: 'Call out for emergency personnel to assist',
          timeLimit: 10,
          consequences: { health: -1 },
          nextNodeId: 'emergency_personnel_assist',
          isCorrect: true,
          educationalNote: 'Smart! Getting professional help is often the best approach.'
        }
      ],
      isEnding: false
    },
    {
      id: 'assisted_descent',
      title: 'Helping Injured Student',
      description: 'You\'re carefully helping the injured student down the stairs. It\'s slower than you\'d like, but you\'re making progress. Other students pass by, some offering encouragement.',
      location: 'Stairwell - Descending',
      environment: {
        smokeLevel: 8,
        fireSpread: 10,
        visibility: 90,
        temperature: 25
      },
      availableItems: [],
      decisions: [
        {
          id: 'continue_helping_down',
          text: 'Continue helping them all the way down',
          timeLimit: 15,
          consequences: { health: -2 },
          nextNodeId: 'heroic_evacuation',
          isCorrect: true,
          educationalNote: 'Heroic! Your compassion and courage helped save someone\'s life.'
        }
      ],
      isEnding: false
    },
    {
      id: 'heroic_evacuation',
      title: 'Heroic Evacuation - Assembly Point',
      description: 'You successfully evacuated while helping an injured student! Paramedics immediately attend to the injured student\'s ankle. University officials and your fellow students commend your bravery and quick thinking. You\'re safe, and you\'re a hero.',
      location: 'Campus Assembly Point',
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
      id: 'emergency_personnel_assist',
      title: 'Professional Assistance Arrives',
      description: 'Emergency personnel quickly arrived and took over helping the injured student. This allowed both you and them to evacuate more safely with professional assistance.',
      location: 'Stairwell',
      environment: {
        smokeLevel: 10,
        fireSpread: 11,
        visibility: 88,
        temperature: 25
      },
      availableItems: [],
      decisions: [
        {
          id: 'proceed_evacuation',
          text: 'Proceed with your evacuation knowing they\'re in good hands',
          timeLimit: 10,
          consequences: { health: 2 },
          nextNodeId: 'successful_evacuation_uni',
          isCorrect: true,
          educationalNote: 'Wise decision! You helped and ensured professional care arrived.'
        }
      ],
      isEnding: false
    },
    {
      id: 'crowd_accident',
      title: 'Crowd Stampede',
      description: 'Your pushing caused a chain reaction in the panicked crowd. Several people fell, including yourself. You\'re bruised and shaken, and the situation has become more chaotic and dangerous.',
      location: 'Hallway - Chaos',
      environment: {
        smokeLevel: 35,
        fireSpread: 20,
        visibility: 60,
        temperature: 35
      },
      availableItems: [],
      decisions: [
        {
          id: 'help_fallen_recover',
          text: 'Help others up and try to restore order',
          timeLimit: 15,
          consequences: { health: -8, oxygen: -10 },
          nextNodeId: 'recovery_effort',
          isCorrect: true,
          educationalNote: 'Good instinct to help fix the situation you contributed to.'
        }
      ],
      isEnding: false
    },
    {
      id: 'recovery_effort',
      title: 'Recovering from Accident',
      description: 'You and others have helped people up. The crowd is moving again, but you\'ve lost valuable time and sustained injuries. You manage to reach the stairwell.',
      location: 'Stairwell Entrance',
      environment: {
        smokeLevel: 30,
        fireSpread: 22,
        visibility: 65,
        temperature: 33
      },
      availableItems: [],
      decisions: [
        {
          id: 'evacuate_injured',
          text: 'Evacuate despite your injuries',
          timeLimit: 10,
          consequences: { health: -5 },
          nextNodeId: 'injured_evacuation',
          isCorrect: true,
          educationalNote: 'You must continue despite injuries - staying is more dangerous.'
        }
      ],
      isEnding: false
    },
    {
      id: 'injured_evacuation',
      title: 'Evacuation - Injured but Safe',
      description: 'You made it out despite your injuries from the stampede. Paramedics treat your cuts and bruises. You\'re alive and safe, but this situation could have been avoided by remaining calm in the crowd.',
      location: 'Campus Medical Area',
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
      id: 'calming_influence',
      title: 'Calming the Crowd',
      description: 'Your calm demeanor is helping others stay composed. The crowd is moving more smoothly now, and you\'re getting closer to the stairwell. Your leadership is making a difference.',
      location: 'Hallway',
      environment: {
        smokeLevel: 22,
        fireSpread: 14,
        visibility: 75,
        temperature: 29
      },
      availableItems: [],
      decisions: [
        {
          id: 'continue_to_stairwell',
          text: 'Continue guiding people toward the stairwell',
          timeLimit: 10,
          consequences: { health: 0 },
          nextNodeId: 'stairwell_approach',
          isCorrect: true,
          educationalNote: 'Great leadership! You\'re helping ensure everyone\'s safety.'
        }
      ],
      isEnding: false
    },
    {
      id: 'elevator_trap',
      title: 'Trapped in Elevator',
      description: 'The elevator stopped between floors and emergency power failed. Smoke is beginning to seep in through the doors. You\'re trapped in one of the most dangerous places during a fire. This is a critical situation.',
      location: 'Elevator - Between Floors',
      environment: {
        smokeLevel: 70,
        fireSpread: 30,
        visibility: 25,
        temperature: 50
      },
      availableItems: [],
      decisions: [],
      isEnding: true,
      endingType: 'failure'
    },
    {
      id: 'stair_injury',
      title: 'Stairwell Injury',
      description: 'You tripped while rushing down the stairs and fell hard, injuring your wrist and knee. Other evacuees help you up, but you\'re in pain and have slowed down the evacuation flow.',
      location: 'Stairwell - 2nd Floor',
      environment: {
        smokeLevel: 10,
        fireSpread: 12,
        visibility: 88,
        temperature: 25
      },
      availableItems: [],
      decisions: [
        {
          id: 'continue_carefully',
          text: 'Continue evacuating carefully despite pain',
          timeLimit: 10,
          consequences: { health: -8 },
          nextNodeId: 'injured_but_safe',
          isCorrect: true,
          educationalNote: 'You must continue evacuating even when injured.'
        }
      ],
      isEnding: false
    },
    {
      id: 'injured_but_safe',
      title: 'Safe but Injured',
      description: 'You made it out of the building with injuries from your fall. Paramedics are treating your wrist and knee. You\'re safe but learned an important lesson about not rushing on stairs during evacuation.',
      location: 'Campus Medical Area',
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
      id: 'extinguisher_danger',
      title: 'Chemical Fire Danger',
      description: 'You attempted to fight what you now realize is a chemical fire with a standard fire extinguisher. The fire flared up dangerously, and you\'ve been exposed to toxic fumes. This was a critical mistake - chemical fires require specialized equipment.',
      location: 'Lab Area - Near Fire',
      environment: {
        smokeLevel: 60,
        fireSpread: 40,
        visibility: 30,
        temperature: 55
      },
      availableItems: [],
      decisions: [
        {
          id: 'retreat_immediately',
          text: 'Retreat immediately and evacuate',
          timeLimit: 8,
          consequences: { health: -10, oxygen: -15 },
          nextNodeId: 'narrow_escape',
          isCorrect: true,
          educationalNote: 'Retreat immediately! Only trained professionals should fight chemical fires.'
        }
      ],
      isEnding: false
    },
    {
      id: 'narrow_escape',
      title: 'Narrow Escape',
      description: 'You barely made it out after your dangerous attempt to fight the fire. You\'re suffering from smoke inhalation and chemical exposure. Emergency medical personnel provide oxygen and treatment. You\'re alive but learned a critical lesson about not fighting fires yourself.',
      location: 'Campus Medical Area - Intensive Care',
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
      id: 'dangerous_delay',
      title: 'Dangerous Delay',
      description: 'By waiting for instructions, you\'ve allowed the fire to spread and smoke to thicken. The lab is now filling with smoke and the situation is becoming critical. You must act now!',
      location: 'Biology Lab - Smoke Filled',
      environment: {
        smokeLevel: 45,
        fireSpread: 30,
        visibility: 50,
        temperature: 40
      },
      availableItems: [],
      decisions: [
        {
          id: 'emergency_evacuation',
          text: 'Evacuate immediately through any available exit',
          timeLimit: 8,
          consequences: { health: -12, oxygen: -15 },
          nextNodeId: 'last_minute_escape',
          isCorrect: true,
          educationalNote: 'You should have evacuated immediately when the alarm sounded!'
        }
      ],
      isEnding: false
    },
    {
      id: 'last_minute_escape',
      title: 'Last Minute Escape',
      description: 'You barely escaped the smoke-filled lab. You\'re suffering from moderate smoke inhalation and are shaken by how close you came to serious danger. Medical personnel provide treatment. Your delay could have been fatal.',
      location: 'Campus Medical Area',
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
      id: 'second_floor_mistake',
      title: 'Second Floor Exit - Wrong Choice',
      description: 'You exited on the second floor and find yourself in a smoke-filled corridor with no clear exit. This was a mistake - you should have continued to ground level. You must find another way out.',
      location: '2nd Floor Hallway',
      environment: {
        smokeLevel: 40,
        fireSpread: 25,
        visibility: 55,
        temperature: 38
      },
      availableItems: [],
      decisions: [
        {
          id: 'return_to_stairwell',
          text: 'Return to the stairwell and continue to ground floor',
          timeLimit: 10,
          consequences: { health: -8, oxygen: -10 },
          nextNodeId: 'stairwell_return',
          isCorrect: true,
          educationalNote: 'Good recovery! Always continue to ground level in stairwells.'
        }
      ],
      isEnding: false
    },
    {
      id: 'stairwell_return',
      title: 'Back to Stairwell',
      description: 'You made it back to the stairwell and descended to ground level. You\'re out but suffered unnecessary smoke exposure from your mistake of leaving the stairwell early.',
      location: 'Campus Grounds',
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
      id: 'alternate_route',
      title: 'Lost in Building',
      description: 'While searching for an alternate exit, you\'ve gotten turned around in the smoke-filled corridors. The building layout is confusing, and you\'re wasting precious time and breath.',
      location: 'Unknown Hallway',
      environment: {
        smokeLevel: 50,
        fireSpread: 28,
        visibility: 45,
        temperature: 42
      },
      availableItems: [],
      decisions: [
        {
          id: 'follow_exit_signs',
          text: 'Look for and follow emergency exit signs',
          timeLimit: 10,
          consequences: { health: -10, oxygen: -12 },
          nextNodeId: 'found_exit',
          isCorrect: true,
          educationalNote: 'Follow exit signs! They\'re designed to lead you to safety.'
        }
      ],
      isEnding: false
    },
    {
      id: 'found_exit',
      title: 'Exit Found - Barely',
      description: 'You finally found an exit and escaped, but you\'re suffering significant smoke inhalation from your detour. This dangerous situation was caused by not taking the nearest safe exit initially.',
      location: 'Campus Grounds - Medical Treatment',
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
    tags: ['university', 'school', 'chemical-fire', 'evacuation', 'education'],
    isPublished: true,
    playCount: 0,
    averageRating: 0,
    averageCompletionTime: 0
  }
};

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
    const officeScenario = new Scenario(officeScenarioData);
    await officeScenario.save();
    console.log(`✅ Inserted: "${officeScenario.title}"`);
    console.log(`🆔 Scenario ID: ${officeScenario._id}`);
    console.log(`📍 Total nodes: ${officeScenario.nodes.length}`);

    // Insert the university scenario
    console.log('\nInserting university scenario...');
    const universityScenario = new Scenario(universityScenarioData);
    await universityScenario.save();
    console.log(`✅ Inserted: "${universityScenario.title}"`);
    console.log(`🆔 Scenario ID: ${universityScenario._id}`);
    console.log(`📍 Total nodes: ${universityScenario.nodes.length}`);

    console.log('\n🎉 Database seeded successfully with 2 scenarios!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();