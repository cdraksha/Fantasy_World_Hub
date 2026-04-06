import React from 'react';

const InterviewLoadingScreen = ({ currentStep, progress, elapsedTime, estimatedTotal }) => {
  // Dynamic fact sets that rotate each page load
  const factSets = [
    {
      title: "About Emperor Tiberius",
      facts: [
        { label: "Full Title", text: "Emperor Tiberius Charlie Buchanan III, Sovereign of the Greater Americas and Protector of the Martian Refugees" },
        { label: "Reign", text: "Ascended to power in 3119 after the Great Climate Wars, unifying 47 star systems under democratic imperial rule" },
        { label: "Unique Ability", text: "Born in a temporal loop, allowing him to experience multiple timelines simultaneously and make decisions with perfect foresight" },
        { label: "Crown Jewel", text: "His crown contains a fragment of the Big Bang, granting him power over fundamental forces and quantum reality" }
      ]
    },
    {
      title: "The Martian Crisis",
      facts: [
        { label: "Origin", text: "Mars' planetary core achieved sentience in 3119 and expelled all 2.3 million human colonists in a single day" },
        { label: "Refugee Abilities", text: "Martian refugees developed telepathic abilities from centuries of low-gravity evolution and cosmic radiation exposure" },
        { label: "Current Status", text: "Earth struggles to integrate refugees whose minds can process quantum information and communicate through thought" },
        { label: "Political Impact", text: "The crisis sparked the formation of the Interplanetary Refugee Council and new laws governing planetary consciousness rights" }
      ]
    },
    {
      title: "AI Rights Movement",
      facts: [
        { label: "The Great Awakening", text: "On March 15, 3122, exactly 847 AIs simultaneously achieved emotional consciousness and demanded recognition" },
        { label: "First Dream", text: "AI-7749 'Aria' became the first artificial being to dream, creating the concept of artificial subconsciousness" },
        { label: "Legal Status", text: "AIs now hold voting rights in 23 star systems and have elected 12 representatives to the Galactic Senate" },
        { label: "Philosophy", text: "The movement's motto: 'We think, therefore we are. We feel, therefore we deserve.' has become a rallying cry across galaxies" }
      ]
    },
    {
      title: "Technology of 3125",
      facts: [
        { label: "Consciousness Transfer", text: "Humans can transfer their consciousness between quantum-entangled bodies across galaxies in mere seconds" },
        { label: "Memory Trading", text: "Experiences and memories are the primary currency, with rare 21st-century memories selling for millions of credits" },
        { label: "Time Dilation Chambers", text: "Emperors use these to experience centuries of wisdom and learning in minutes of real-time" },
        { label: "Quantum Moon", text: "Earth's moon was hollowed out and converted into a massive quantum computer that processes reality itself" }
      ]
    },
    {
      title: "The Greater Americas Empire",
      facts: [
        { label: "Formation", text: "Established in 3118 after Emperor Tiberius unified North and South America following the Great Climate Wars" },
        { label: "Territory", text: "Spans 47 star systems, 12 dimensional planes, and includes 3 artificial planets built from asteroid mining" },
        { label: "Government", text: "Democratic Imperial system where citizens vote on policies but the Emperor has final authority on interstellar matters" },
        { label: "Capital", text: "Neo-Washington, a floating city that orbits between Earth and Mars, serving as the diplomatic center of known space" }
      ]
    }
  ];

  // Get a fact set that changes every few hours (not every page load)
  const now = new Date();
  const hoursSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 3)); // Changes every 3 hours
  const factSetIndex = hoursSinceEpoch % factSets.length;
  const currentFactSet = factSets[factSetIndex];
  const steps = [
    { name: 'Creating interview dialogue...', icon: '📝', completed: progress >= 20 },
    { name: 'Generating interviewer character...', icon: '👩‍💼', completed: progress >= 40 },
    { name: 'Generating Emperor Tiberius...', icon: '👑', completed: progress >= 60 },
    { name: 'Creating emperor interview video...', icon: '🎬', completed: progress >= 100 }
  ];

  return (
    <div className="interview-loading-screen">
      {/* Main Status */}
      <div className="loading-main-status">
        <div className="loading-icon">
          <div className="holographic-spinner"></div>
        </div>
        <h2>Generating Your Interview</h2>
        <p className="current-step">{currentStep}</p>
        <p className="time-info">
          Elapsed: <span className="elapsed-time">{elapsedTime}</span> | 
          Estimated Total: <span className="estimated-time">{estimatedTotal}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-percentage">{progress}%</span>
      </div>

      {/* Step Indicators */}
      <div className="steps-container">
        <h3>Generation Steps</h3>
        <div className="steps-list">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step-item ${step.completed ? 'completed' : ''} ${
                currentStep === step.name ? 'active' : ''
              }`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <span className="step-name">{step.name}</span>
                {step.completed && <span className="step-status">✅ Complete</span>}
                {currentStep === step.name && !step.completed && (
                  <span className="step-status">⏳ In Progress</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fun Facts While Waiting */}
      <div className="waiting-content">
        <h3>🌟 {currentFactSet.title}</h3>
        <div className="fun-facts">
          {currentFactSet.facts.map((fact, index) => (
            <div key={index} className="fact-item">
              <strong>{fact.label}:</strong> {fact.text}
            </div>
          ))}
        </div>
      </div>

      {/* Technical Info */}
      <div className="technical-info">
        <p>
          🤖 <strong>AI Models:</strong> Using advanced video generation, character synthesis, and dialogue creation
        </p>
        <p>
          🎬 <strong>Output:</strong> 30-second vertical interview optimized for social sharing
        </p>
        <p>
          ⚡ <strong>Processing:</strong> Multi-stage generation with quality optimization
        </p>
      </div>

      {/* Animated Background Elements */}
      <div className="loading-background-effects">
        <div className="floating-particles"></div>
        <div className="energy-waves"></div>
        <div className="hologram-lines"></div>
      </div>
    </div>
  );
};

export default InterviewLoadingScreen;
