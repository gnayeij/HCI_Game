# University Science Lab Fire Emergency Scenario

## Overview
A new scenario has been added to the fire safety training game featuring a university science building emergency. This scenario provides a different environment and challenges compared to the office building scenario.

## Scenario Details

### Basic Information
- **Title**: University Science Lab Fire Emergency
- **Category**: School
- **Difficulty**: Medium
- **Estimated Duration**: 320 seconds (~5.3 minutes)
- **Total Decision Nodes**: 27 nodes

### Setting
The scenario takes place in a university science building where a chemical fire has broken out in a chemistry lab. The player is a student working in a biology lab on the 3rd floor when the fire alarm sounds.

### Learning Objectives
1. Safe evacuation from educational facilities
2. Handling chemical fire emergencies
3. Understanding fire alarm protocols in schools
4. Assisting others during emergencies in crowded spaces
5. Proper use of fire safety equipment

### Key Features

#### Unique Elements
- **Group Dynamics**: Unlike the office scenario, this involves coordinating with fellow students
- **Chemical Fire**: Introduces the danger of attempting to fight specialized fires
- **Buddy System**: Players can organize evacuation using a buddy system
- **Crowded Hallways**: Deals with panic and crowd management in educational settings
- **Multiple Helper Scenarios**: Options to assist injured or confused students

#### Decision Paths
The scenario includes multiple branching paths based on player choices:

1. **Leadership Path**: Check door, prepare group, organize evacuation
2. **Solo Evacuation**: Immediate exit through crowded hallways
3. **Helper Path**: Assist injured or confused students
4. **Dangerous Choices**: Fighting the fire, using elevators, rushing on stairs

#### Ending Types
- **Success Endings**: 
  - Successful group evacuation
  - Heroic evacuation (helping injured student)
  
- **Partial Success Endings**:
  - Injured but safe (from rushing or stampede)
  - Narrow escape (from fighting fire or delays)
  - Safe after mistakes (wrong exits, detours)
  
- **Failure Endings**:
  - Trapped in elevator
  - Lost in heavy smoke

### Educational Elements

Each decision includes:
- **Time limits**: Realistic pressure for decision-making
- **Consequences**: Health, oxygen, visibility effects
- **Educational notes**: Explanations of why choices are correct or incorrect
- **Environmental feedback**: Changing smoke levels, temperature, visibility

### Key Safety Lessons
1. Never use elevators during a fire
2. Always check doors before opening
3. Don't attempt to fight chemical fires without training
4. Evacuate immediately when alarm sounds - don't wait
5. Stay calm in crowds to prevent stampedes
6. Continue to ground level in stairwells
7. Use wet cloth to filter smoke
8. Help others but ensure your own safety first
9. Follow emergency exit signs
10. Don't waste time gathering belongings

## Implementation

### Database
The scenario has been added to the MongoDB database using the `seedScenarios.js` script. The database now contains:
1. Office Building Fire Emergency (19 nodes)
2. University Science Lab Fire Emergency (27 nodes)

### Files Modified
- `backend/seedScenarios.js` - Added university scenario data and updated seeding function

### How to Run
From the backend directory:
```bash
node seedScenarios.js
```

## Game Integration
The scenario will automatically appear in the scenarios selection screen alongside the office building scenario. Players can:
1. View scenario details (description, difficulty, duration, learning objectives)
2. Select difficulty level before starting
3. Play through the scenario making timed decisions
4. Receive feedback and learn fire safety principles

## Future Enhancements
Potential additions for this scenario:
- Laboratory-specific hazards (chemical spills, gas leaks)
- Fire blanket usage mechanics
- Emergency assembly point attendance
- Communication with emergency services
- Multiple floors with different conditions
- Evacuation of special populations (disabled students)
