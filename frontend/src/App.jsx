import React, { useState } from 'react';
import './App.css';
import ProjectCreate from './components/ProjectCreate';
import Brainstorm from './components/Brainstorm';
import SetGoals from './components/SetGoals';
import BreakItDown from './components/BreakItDown';
import AssignRoles from './components/AssignRoles';
import Reflection from './components/Reflection';
import Export from './components/Export';
import Navigation from './components/Navigation';

function App() {
  const [step, setStep] = useState(1);
  const [projectState, setProjectState] = useState({
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🚀 Sprint Kit</h1>
        <p>Plan your project. Learn real skills.</p>
        
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
