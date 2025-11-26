import React, { useEffect, useState, useCallback } from 'react';
import { useTutorial } from '../../contexts/TutorialContext';
import { useLocation } from 'react-router-dom';
import TutorialTooltip from './TutorialTooltip';
import './TutorialOverlay.css';

const TutorialOverlay = () => {
  const { isActive, getCurrentStep, nextStep, skipTutorial } = useTutorial();
  const location = useLocation();
  const [targetElement, setTargetElement] = useState(null);
  const [spotlightStyle, setSpotlightStyle] = useState({});

  const currentStep = getCurrentStep();

  console.log('TutorialOverlay - isActive:', isActive, 'currentStep:', currentStep?.id, 'location:', location.pathname);

  // Find the target element and calculate spotlight position
  const updateSpotlight = useCallback(() => {
    if (!currentStep || !currentStep.target) {
      setTargetElement(null);
      setSpotlightStyle({});
      return;
    }

    const element = document.querySelector(currentStep.target);
    console.log('Tutorial: Looking for element:', currentStep.target, 'Found:', !!element);
    
    if (element) {
      console.log('Tutorial: Setting target element for step:', currentStep.id);
      setTargetElement(element);
      
      const rect = element.getBoundingClientRect();
      const padding = 10; // Extra padding around the element

      setSpotlightStyle({
        top: `${rect.top - padding}px`,
        left: `${rect.left - padding}px`,
        width: `${rect.width + padding * 2}px`,
        height: `${rect.height + padding * 2}px`,
      });

      // Make the target element clickable by increasing its z-index
      element.style.position = 'relative';
      element.style.zIndex = '10002';
      element.style.pointerEvents = 'auto';

      // Scroll element into view smoothly
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    } else {
      // Element not found, wait and retry (max 20 retries = 2 seconds)
      const retryCount = (currentStep.retryCount || 0) + 1;
      if (retryCount < 20) {
        console.log('Tutorial: Element not found, retry', retryCount);
        currentStep.retryCount = retryCount;
        setTimeout(updateSpotlight, 100);
      } else {
        console.error('Tutorial: Element not found after 20 retries:', currentStep.target);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    // Reset target element when location or step changes
    setTargetElement(null);
    setSpotlightStyle({});
    
    if (isActive && currentStep) {
      // Small delay to let the new page render
      const timer = setTimeout(() => {
        updateSpotlight();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, location.pathname, updateSpotlight]);

  useEffect(() => {
    if (targetElement) {
      // Update on window resize
      window.addEventListener('resize', updateSpotlight);
      window.addEventListener('scroll', updateSpotlight, true);
      
      return () => {
        window.removeEventListener('resize', updateSpotlight);
        window.removeEventListener('scroll', updateSpotlight, true);
        
        // Cleanup: reset z-index of previous target element
        targetElement.style.zIndex = '';
        targetElement.style.position = '';
        targetElement.style.pointerEvents = '';
      };
    }
  }, [targetElement, updateSpotlight]);

  const handleOverlayClick = (e) => {
    // Only prevent clicks on the dark overlay itself, not on highlighted elements
    if (e.target.classList.contains('tutorial-overlay')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!isActive || !currentStep) {
    return null;
  }

  return (
    <div className="tutorial-overlay-wrapper">
      {/* Four overlay panels that create a "hole" around the spotlight */}
      {targetElement && spotlightStyle.top && (
        <>
          {/* Top panel */}
          <div 
            className="tutorial-overlay-panel tutorial-overlay-top"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: spotlightStyle.top,
            }}
            onClick={handleOverlayClick}
          />
          
          {/* Bottom panel */}
          <div 
            className="tutorial-overlay-panel tutorial-overlay-bottom"
            style={{
              top: `calc(${spotlightStyle.top} + ${spotlightStyle.height})`,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={handleOverlayClick}
          />
          
          {/* Left panel */}
          <div 
            className="tutorial-overlay-panel tutorial-overlay-left"
            style={{
              top: spotlightStyle.top,
              left: 0,
              width: spotlightStyle.left,
              height: spotlightStyle.height,
            }}
            onClick={handleOverlayClick}
          />
          
          {/* Right panel */}
          <div 
            className="tutorial-overlay-panel tutorial-overlay-right"
            style={{
              top: spotlightStyle.top,
              left: `calc(${spotlightStyle.left} + ${spotlightStyle.width})`,
              right: 0,
              height: spotlightStyle.height,
            }}
            onClick={handleOverlayClick}
          />
          
          {/* Spotlight border/glow effect */}
          <div 
            className="tutorial-spotlight" 
            style={{
              ...spotlightStyle,
              pointerEvents: 'none'
            }}
          />
        </>
      )}
      
      {!targetElement && (
        <div 
          className="tutorial-overlay" 
          onClick={handleOverlayClick}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Tooltip */}
      <TutorialTooltip
        step={currentStep}
        targetElement={targetElement}
        onNext={nextStep}
        onSkip={skipTutorial}
      />
    </div>
  );
};

export default TutorialOverlay;
