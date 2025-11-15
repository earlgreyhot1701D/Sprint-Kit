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
  const [darkMode, setDarkMode] = useState(false);
  const [projectState, setProjectState] = useState({
    title: '',
    description: '',
    team_size: '1',
    experience_level: 'beginner',
    project_type: 'other',
    brainstormIdeas: [],
    goals: {},
    tasks: [],
    tasksEdited: false,
    teamMembers: [],
    assignments: {},
    timeline: {},
    reflection: {
      prompts: [],      // NEW: Custom reflection prompts
      answers: [],      // NEW: Answers indexed to prompts
      went_well: '',    // OLD: Keep for backward compatibility
      was_hard: '',     // OLD: Keep for backward compatibility
      differently: ''   // OLD: Keep for backward compatibility
    },
    insights: [],
    badges: []
  });

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    if (showIntro) {
      document.body.classList.add('intro-active');
    } else {
      document.body.classList.remove('intro-active');
    }
  }, [darkMode, showIntro]);

  // Fix #11: Remove unused skipSteps parameter
  const handleIntroComplete = () => {
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

  const handleStartOver = () => {
    setShowIntro(true);
    setStep(1);
    setProjectState({
      title: '',
      description: '',
      team_size: '1',
      experience_level: 'beginner',
      project_type: 'other',
      brainstormIdeas: [],
      goals: {},
      tasks: [],
      tasksEdited: false,
      teamMembers: [],
      assignments: {},
      timeline: {},
      reflection: {
        prompts: [],
        answers: [],
        went_well: '',
        was_hard: '',
        differently: ''
      },
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

  return (
    <div className="App">
      <header className="header" role="banner">
        <h1>🚀 Sprint Kit</h1>
        <p>Plan your project. Learn real skills.</p>

        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={darkMode}
          tabIndex={0}
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <nav className="step-dots" aria-label="Project progress">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i + 1}
              className={`dot ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={7}
              aria-label={`Step ${i + 1}${step > i + 1 ? ' completed' : ''}`}
              tabIndex={0}
            />
          ))}
        </nav>

        <div className="progress-bar" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={7}>
          <div
            className="progress-fill"
            style={{ width: `${(step / 7) * 100}%` }}
            aria-label={`Progress: ${Math.round((step / 7) * 100)}% complete`}
          ></div>
        </div>
        <p className="step-indicator" aria-live="polite">Step {step} of 7</p>
      </header>

      <main className="main-content" role="main" aria-label={`Step ${step} of 7`}>
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
