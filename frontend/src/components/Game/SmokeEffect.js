import React from 'react';
import './SmokeEffect.css';

const SmokeEffect = ({ timeRemaining, maxTime, oxygenLevel }) => {
  // Calculate smoke intensity based on timer progression (0-100%)
  // When time is full, smoke is minimal; when time runs out, smoke is at maximum
  const timerProgress = maxTime > 0 ? ((maxTime - timeRemaining) / maxTime) * 100 : 0;
  
  // Also factor in oxygen level for additional urgency
  const oxygenFactor = 100 - oxygenLevel; // Lower oxygen = more smoke
  
  // Combine both factors (weighted: 70% timer, 30% oxygen)
  // Add a minimum base intensity of 50% so smoke is very visible
  const smokeIntensity = Math.min(100, 50 + (timerProgress * 0.5 + oxygenFactor * 0.5));
  
  // Calculate opacity for smoke overlay (0.6 to 1.0 for high visibility)
  const smokeOpacity = 0.6 + (smokeIntensity / 100) * 0.4;
  
  // Calculate number of smoke particles (more as intensity increases)
  const particleCount = Math.floor(30 + (smokeIntensity / 100) * 40); // 30 to 70 particles
  
  // Calculate darkness of background tint (0.3 to 0.8)
  const darknessLevel = 0.3 + (smokeIntensity / 100) * 0.5;
  
  // Debug logging
  console.log('SmokeEffect rendering:', {
    timeRemaining,
    maxTime,
    oxygenLevel,
    timerProgress: timerProgress.toFixed(1),
    smokeIntensity: smokeIntensity.toFixed(1),
    smokeOpacity: smokeOpacity.toFixed(2),
    particleCount,
    darknessLevel: darknessLevel.toFixed(2)
  });
  
  return (
    <div className="smoke-effect-container">
      {/* Dark overlay that increases with smoke */}
      <div 
        className="smoke-darkness" 
        style={{ opacity: darknessLevel }}
      />
      
      {/* Smoke particles */}
      <div 
        className="smoke-particles" 
        style={{ opacity: smokeOpacity }}
      >
        {[...Array(particleCount)].map((_, index) => {
          // Randomize particle properties for natural smoke effect
          const delay = Math.random() * 8;
          const duration = 8 + Math.random() * 8; // 8-16 seconds
          const startX = Math.random() * 100;
          const endX = startX + (Math.random() - 0.5) * 40; // Drift sideways
          const scale = 0.8 + Math.random() * 1.5; // Size variation
          const opacity = 0.3 + Math.random() * 0.4; // Opacity variation
          
          return (
            <div
              key={index}
              className="smoke-particle"
              style={{
                left: `${startX}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                '--end-x': `${endX}%`,
                '--scale': scale,
                '--opacity': opacity,
              }}
            />
          );
        })}
      </div>
      
      {/* Intensity indicator for debugging (optional - can be removed) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="smoke-debug">
          Smoke: {Math.round(smokeIntensity)}%
        </div>
      )}
    </div>
  );
};

export default SmokeEffect;
