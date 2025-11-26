import React, { useState, useEffect } from 'react';
import { useTutorial } from '../../contexts/TutorialContext';
import './TutorialTooltip.css';

const TutorialTooltip = ({ step, targetElement, onNext, onSkip }) => {
  const { currentStepIndex, steps } = useTutorial();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState('top');

  useEffect(() => {
    if (!targetElement) {
      // Center tooltip when no target (for completion screen)
      setPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
      setArrowPosition('none');
      return;
    }

    const calculatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 400;
      const tooltipHeight = 250;
      const padding = 20;
      const arrowSize = 12;

      let top, left, arrow;

      switch (step.position) {
        case 'top':
          top = rect.top - tooltipHeight - arrowSize - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = 'bottom';
          break;
        case 'bottom':
          top = rect.bottom + arrowSize + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = 'top';
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - arrowSize - padding;
          arrow = 'right';
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + arrowSize + padding;
          arrow = 'left';
          break;
        case 'center':
          top = window.innerHeight / 2 - tooltipHeight / 2;
          left = window.innerWidth / 2 - tooltipWidth / 2;
          arrow = 'none';
          break;
        default:
          top = rect.bottom + arrowSize + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = 'top';
      }

      // Keep tooltip within viewport
      const viewportPadding = 20;
      
      // Horizontal bounds - keep tooltip centered but within viewport
      if (left < viewportPadding) {
        left = viewportPadding;
      } else if (left + tooltipWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - tooltipWidth - viewportPadding;
      }
      
      // Vertical bounds
      if (top < viewportPadding) {
        // If tooltip would go above viewport, position it below instead
        top = rect.bottom + arrowSize + padding;
        arrow = 'top';
      } else if (top + tooltipHeight > window.innerHeight - viewportPadding) {
        // If tooltip would go below viewport, position it above instead
        top = rect.top - tooltipHeight - arrowSize - padding;
        arrow = 'bottom';
      }

      setPosition({ top: `${top}px`, left: `${left}px` });
      setArrowPosition(arrow);
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    
    return () => window.removeEventListener('resize', calculatePosition);
  }, [targetElement, step.position]);

  const handleNext = () => {
    if (step.action === 'click' && targetElement) {
      // Let the user click the element
      // The navigation will be handled by the component itself
      return;
    }
    
    // If this is the last step (completion), call onSkip to mark tutorial as complete
    if (isLastStep) {
      onSkip(); // This marks hasSeenTutorial as true and closes tutorial
    } else {
      onNext();
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isCompletionStep = step.id === 'tutorial-complete';

  return (
    <div 
      className={`tutorial-tooltip tutorial-tooltip-arrow-${arrowPosition}`}
      style={position}
    >
      <div className="tutorial-tooltip-header">
        <h3>{step.title}</h3>
        {!isCompletionStep && (
          <button 
            className="tutorial-close-btn"
            onClick={onSkip}
            aria-label="Skip tutorial"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="tutorial-tooltip-body">
        <p>{step.description}</p>
      </div>

      <div className="tutorial-tooltip-footer">
        <div className="tutorial-progress">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
        <div className="tutorial-actions">
          {!isCompletionStep && (
            <button 
              className="tutorial-btn tutorial-btn-skip"
              onClick={onSkip}
            >
              Skip Tutorial
            </button>
          )}
          {step.action === 'none' && (
            <button 
              className="tutorial-btn tutorial-btn-primary"
              onClick={handleNext}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="tutorial-progress-dots">
        {steps.map((_, index) => (
          <span 
            key={index}
            className={`tutorial-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TutorialTooltip;
