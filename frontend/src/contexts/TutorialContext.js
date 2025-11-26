import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const TutorialContext = createContext();

// Tutorial steps definition
const TUTORIAL_STEPS = [
  {
    id: 'home-start',
    page: '/',
    target: '#start-training-btn',
    title: 'Welcome to Fire Safety Trainer! 👋',
    description: 'Let\'s take a quick tour to show you how to start your first training scenario. Click on "Start Training" to begin.',
    position: 'bottom',
    action: 'click'
  },
  {
    id: 'scenarios-list',
    page: '/scenarios',
    target: '.scenario-card:first-child .start-button',
    title: 'Choose a Scenario 🏢',
    description: 'Here you can see all available training scenarios. Each scenario offers unique emergency situations. Click "Start Training" to select this scenario.',
    position: 'top',
    action: 'click'
  },
  {
    id: 'difficulty-selection',
    page: '/difficulty',
    target: '.difficulty-card.green',
    title: 'Select Your Difficulty 🌱',
    description: 'Choose your difficulty level. We recommend starting with Easy mode for your first scenario. Each difficulty affects how much time you have to make decisions. Click on the Easy difficulty card.',
    position: 'top',
    action: 'click'
  },
  {
    id: 'game-decision',
    page: '/game',
    target: '.decision-option:first-child',
    title: 'Make Your Decision 🎯',
    description: 'Read the scenario carefully and choose one of the available options. Each decision affects your survival chances. Select one of the options to continue.',
    position: 'left',
    action: 'click'
  },
  {
    id: 'tutorial-complete',
    page: '/game',
    target: null,
    title: 'Tutorial Complete! 🎉',
    description: 'Great job! You\'ve learned the basics. Continue playing to improve your emergency response skills. Good luck!',
    position: 'center',
    action: 'none'
  }
];

const initialState = {
  isActive: false,
  currentStepIndex: 0,
  completedSteps: [],
  hasSeenTutorial: false,
};

export const TutorialProvider = ({ children }) => {
  // Check if user has seen tutorial before
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('tutorialState');
    if (saved) {
      try {
        return { ...initialState, ...JSON.parse(saved) };
      } catch (e) {
        return initialState;
      }
    }
    return initialState;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tutorialState', JSON.stringify({
      hasSeenTutorial: state.hasSeenTutorial,
      completedSteps: state.completedSteps
    }));
  }, [state.hasSeenTutorial, state.completedSteps]);

  const startTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStepIndex: 0,
      completedSteps: []
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const currentStep = TUTORIAL_STEPS[prev.currentStepIndex];
      const newCompletedSteps = [...prev.completedSteps, currentStep.id];
      const nextIndex = prev.currentStepIndex + 1;

      // If we've reached the end
      if (nextIndex >= TUTORIAL_STEPS.length) {
        return {
          ...prev,
          isActive: false,
          hasSeenTutorial: true,
          completedSteps: newCompletedSteps,
          currentStepIndex: 0
        };
      }

      return {
        ...prev,
        currentStepIndex: nextIndex,
        completedSteps: newCompletedSteps
      };
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      hasSeenTutorial: true
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    setState({
      ...initialState,
      isActive: false,
      hasSeenTutorial: false
    });
    localStorage.removeItem('tutorialState');
  }, []);

  const getCurrentStep = useCallback(() => {
    return TUTORIAL_STEPS[state.currentStepIndex] || null;
  }, [state.currentStepIndex]);

  const isStepActive = useCallback((stepId) => {
    const currentStep = getCurrentStep();
    return state.isActive && currentStep && currentStep.id === stepId;
  }, [state.isActive, getCurrentStep]);

  const value = useMemo(() => ({
    ...state,
    steps: TUTORIAL_STEPS,
    startTutorial,
    nextStep,
    skipTutorial,
    resetTutorial,
    getCurrentStep,
    isStepActive
  }), [state, startTutorial, nextStep, skipTutorial, resetTutorial, getCurrentStep, isStepActive]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export default TutorialContext;
