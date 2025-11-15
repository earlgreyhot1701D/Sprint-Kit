import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { FORM_LIMITS, showSoftPrompt } from '../utils/formValidation';

export default function Reflection({ projectState, onNext, onBack, onUpdate }) {
  const [reflectionPrompts, setReflectionPrompts] = useState(
    projectState.reflection?.prompts || []
  );
  const [reflectionAnswers, setReflectionAnswers] = useState(
    projectState.reflection?.answers || []
  );
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptsError, setPromptsError] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  // Fetch adaptive reflection prompts on mount
  useEffect(() => {
    if (reflectionPrompts.length === 0) {
      fetchAdaptivePrompts();
    }
  }, []);

  // Sync answers to parent state whenever they change
  useEffect(() => {
    if (reflectionPrompts.length > 0 && reflectionAnswers.length > 0) {
      onUpdate({
        reflection: {
          prompts: reflectionPrompts,
          answers: reflectionAnswers,
          went_well: reflectionAnswers[0] || '',
          was_hard: reflectionAnswers[1] || '',
          learned: reflectionAnswers[2] || ''
        }
      });
    }
  }, [reflectionAnswers]);

  const fetchAdaptivePrompts = async () => {
    setLoadingPrompts(true);
    setPromptsError(null);

    const result = await api.getReflectionPrompts(
      projectState.project_type || 'other',
      projectState.title || 'Project',
      '',
      '',
      ''
    );

    if (result.success && result.data.prompts && result.data.prompts.length > 0) {
      const newPrompts = result.data.prompts;
      setReflectionPrompts(newPrompts);
      // Initialize answers array to match prompts length
      const initialAnswers = new Array(newPrompts.length).fill('');
      setReflectionAnswers(initialAnswers);

      // Immediately sync to parent state
      onUpdate({
        reflection: {
          prompts: newPrompts,
          answers: initialAnswers,
          went_well: '',
          was_hard: '',
          learned: ''
        }
      });
    } else {
      setPromptsError('Could not load custom prompts. Using defaults.');
      const defaultPrompts = [
        'What did you learn about how to plan a project?',
        'What was challenging about the planning process?',
        'What did you learn about yourself as a planner?'
      ];
      setReflectionPrompts(defaultPrompts);
      const initialAnswers = new Array(defaultPrompts.length).fill('');
      setReflectionAnswers(initialAnswers);

      // Sync defaults to parent state
      onUpdate({
        reflection: {
          prompts: defaultPrompts,
          answers: initialAnswers,
          went_well: '',
          was_hard: '',
          learned: ''
        }
      });
    }

    setLoadingPrompts(false);
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...reflectionAnswers];
    newAnswers[idx] = value;
    setReflectionAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: all answers have minimum length
    const minLength = FORM_LIMITS.reflection.min;
    const allValid = reflectionAnswers.every(
      (answer) => answer && answer.trim().length >= minLength
    );

    if (!allValid) {
      alert(`Please answer all questions (at least ${minLength} characters each)`);
      return;
    }

    // Show loading state while generating insights
    setGeneratingInsights(true);

    // Generate insights based on their answers
    const insightsResult = await api.generateReflectionInsights(
      projectState.title,
      projectState.project_type || 'other',
      {
        prompts: reflectionPrompts,
        answers: reflectionAnswers
      }
    );

    setGeneratingInsights(false);

    // Extract insights
    const insights = insightsResult.success && insightsResult.data.insights
      ? insightsResult.data.insights
      : [];

    // Update state with insights (reflection already synced via useEffect)
    onUpdate({
      reflection: {
        prompts: reflectionPrompts,
        answers: reflectionAnswers,
        went_well: reflectionAnswers[0] || '',
        was_hard: reflectionAnswers[1] || '',
        learned: reflectionAnswers[2] || ''
      },
      insights
    });

    // Small delay to ensure state update completes before navigation
    setTimeout(() => {
      onNext();
    }, 50);
  };

  const limits = FORM_LIMITS.reflection;

  return (
    <div className="step-container">
      <h2>🤔 What Did You Learn About Planning?</h2>

      <p className="section-intro">
        Your project: <strong>{projectState.title}</strong>
      </p>

      <div className="hint-box">
        <p>
          💡 Take a moment to think about your planning process. What did you learn about breaking down projects, estimating time, and working with your team?
        </p>
      </div>

      {loadingPrompts && (
        <div className="loading-state">
          <div className="spinner">
            <div className="spinner-circle"></div>
          </div>
          <p className="loading-text">⏳ Claude is personalizing your reflection questions...</p>
        </div>
      )}

      {promptsError && (
        <div className="warning-message">
          <p>{promptsError}</p>
        </div>
      )}

      {!loadingPrompts && (
        <form onSubmit={handleSubmit} className="form">
          <div className="reflection-fields">
            {reflectionPrompts.map((prompt, idx) => (
              <div key={idx} className="form-group reflection-group">
                <label htmlFor={`reflection-${idx}`}>
                  <strong>{prompt}</strong>
                </label>

                <textarea
                  id={`reflection-${idx}`}
                  placeholder="Share your thoughts here..."
                  value={reflectionAnswers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  minLength={limits.min}
                  maxLength={limits.max}
                  required
                  className="reflection-textarea"
                  disabled={generatingInsights}
                />

                <div className="char-counter">
                  {showSoftPrompt(reflectionAnswers[idx]?.length || 0, limits.soft) && (
                    <small className="soft-prompt">
                      💡 Tell us more! ({reflectionAnswers[idx]?.length || 0}/{limits.soft})
                    </small>
                  )}

                  {(reflectionAnswers[idx]?.length || 0) > limits.soft && (
                    <small className="char-count">
                      {reflectionAnswers[idx]?.length || 0}/{limits.max}
                    </small>
                  )}

                  {(reflectionAnswers[idx]?.length || 0) > limits.max && (
                    <small className="char-warning">
                      ✕ Max {limits.max} characters
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onBack} className="btn-secondary" disabled={generatingInsights}>
              ← Back
            </button>
            <button type="submit" className="btn-primary" disabled={generatingInsights}>
              {generatingInsights ? 'Generating insights...' : 'See my project →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
