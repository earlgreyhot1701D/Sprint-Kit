import React, { useState, useEffect } from 'react';
import './App.css';
import Intro from './components/Intro';
import ProjectCreate from './components/ProjectCreate';
import Brainstorm from './components/Brainstorm';
import SetGoals from './components/SetGoals';
import BreakItDown from './components/BreakItDown';
import AssignRoles from './components/AssignRoles';
import Reflection from './components/Reflection';
import Export from './components/Export';
import Navigation from './components/Navigation';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false); // Default to Light Mode
  const [projectState, setProjectState] = useState({
    step: 1,
    title: '',
    description: '',
    brainstormIdeas: [],
    goals: {},
    tasks: [],
    tasksEdited: false,
    teamMembers: [], // Will be set on the ProjectCreate screen (Step 1)
    assignments: {},
    timeline: {},
    reflection: {},
    insights: [],
    badges: []
  });

  // NEW: Theme Toggle Function
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // EFFECT TO MANAGE GLOBAL BODY CLASS AND INTRO BACKGROUND
  useEffect(() => {
    // 1. Apply Dark/Light Mode Class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // 2. Manage Intro Background (White background only when Intro is active)
    if (showIntro) {
      document.body.classList.add('intro-active');
    } else {
      document.body.classList.remove('intro-active');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('intro-active');
    };
  }, [darkMode, showIntro]); // Dependencies

  // Handle Intro completion - NO TEAM MEMBERS ARE PASSED ANYMORE
  const handleIntroComplete = ({ skipSteps }) => {
    // No team members to set, they will be set in ProjectCreate
    setShowIntro(false);
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleNext = (newData = {}) => {
    setProjectState(prev => ({ ...prev, ...newData }));
    if (step < 7) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleUpdateProject = (updates) => {
    setProjectState(prev => ({ ...prev, ...updates }));
  };

  // Start over - go back to Intro
  const handleStartOver = () => {
    setShowIntro(true);
    setStep(1);
    setProjectState({
      step: 1,
      title: '',
      description: '',
      brainstormIdeas: [],
      goals: {},
      tasks: [],
      tasksEdited: false,
      teamMembers: [],
      assignments: {},
      timeline: {},
      reflection: {},
      insights: [],
      badges: []
    });
    window.scrollTo(0, 0);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ProjectCreate
            projectState={projectState}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Brainstorm
            projectState={projectState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <SetGoals
            projectState={projectState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <BreakItDown
            projectState={projectState}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={handleUpdateProject}
          />
        );
      case 5:
        return (
          <AssignRoles
            projectState={projectState}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={handleUpdateProject}
          />
        );
      case 6:
        return (
          <Reflection
            projectState={projectState}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={handleUpdateProject}
          />
        );
      case 7:
        return (
          <Export
            projectState={projectState}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        );
      default:
        return null;
    }
  };

  // Show Intro screen first
  if (showIntro) {
    return (
      <div className="App-Intro-Wrapper">
        <Intro
          onStart={handleIntroComplete}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      </div>
    );
  }

  // Show main flow after Intro
  return (
    <div className="App">
      <header className="header">
        <h1>🚀 Sprint Kit</h1>
        <p>Plan your project. Learn real skills.</p>

        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Mode">
          {darkMode ? '☀️ Light Mode' : '🌑 Dark Mode'}
        </button>

        {/* Step indicator dots */}
        <div className="step-dots">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i + 1}
              className={`dot ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}
              title={`Step ${i + 1}`}
            />
          ))}
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(step / 7) * 100}%` }}
          ></div>
        </div>
        <p className="step-indicator">Step {step} of 7</p>
      </header>

      <main className="main-content">
        {renderStep()}
      </main>

      <Navigation
        step={step}
        totalSteps={7}
        onBack={handleBack}
      />
    </div>
  );
}

export default App;
