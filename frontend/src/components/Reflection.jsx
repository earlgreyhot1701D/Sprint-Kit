import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Reflection({ projectState, onNext, onBack, onUpdate }) {
  const [reflection, setReflection] = useState(projectState.reflection || {});
  const [insights, setInsights] = useState(projectState.insights || []);
  const [badges, setBadges] = useState(projectState.badges || []);
  const [badgesRevealed, setBadgesRevealed] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const MIN_LENGTH = 20;

  const generateInsights = async () => {
    const allFilled =
      (reflection.went_well?.length || 0) >= MIN_LENGTH &&
      (reflection.was_hard?.length || 0) >= MIN_LENGTH &&
      (reflection.differently?.length || 0) >= MIN_LENGTH;

    if (!allFilled) {
      alert('Please fill all reflection fields with at least 20 characters each');
      return;
    }

    setInsightsLoading(true);

    const result = await api.generateReflectionInsights(projectState.title, reflection);

    if (result.success && result.data.insights) {
      setInsights(result.data.insights);
    } else {
      setInsights([
        'You thought about how you planned. That is metacognition!',
        'You worked through challenges and kept going. That is persistence.',
        'You reflected on your process, not just the result. That is how real learners think!'
      ]);
    }

    setInsightsLoading(false);
  };

  const awardBadges = async () => {
    setBadgesLoading(true);

    // Calculate timeline accuracy (mock for now)
    const timelineAccuracy = 1.0; // This would come from actual project data

    const result = await api.awardBadges(
      JSON.stringify(reflection),
      projectState.tasksEdited || false,
      timelineAccuracy
    );

    if (result.success && result.data.badges) {
      setBadges(result.data.badges);
      // Trigger animation after short delay
      setTimeout(() => setBadgesRevealed(true), 200);
    }

    setBadgesLoading(false);
  };

  const handleReflectionChange = (field, value) => {
    setReflection({ ...reflection, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};

    if (!reflection.went_well || reflection.went_well.length < MIN_LENGTH) {
      newErrors.went_well = `At least ${MIN_LENGTH} characters`;
    }

    if (!reflection.was_hard || reflection.was_hard.length < MIN_LENGTH) {
      newErrors.was_hard = `At least ${MIN_LENGTH} characters`;
    }

    if (!reflection.differently || reflection.differently.length < MIN_LENGTH) {
      newErrors.differently = `At least ${MIN_LENGTH} characters`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Award badges if not already done
    if (badges.length === 0) {
      awardBadges();
    }

    onUpdate({
      reflection,
      insights,
      badges
    });

    onNext();
  };

  return (
    <div className="step-container">
      <h2>🤔 Reflect on Your Plan</h2>

      <p className="section-intro">
        Your project: <strong>{projectState.title}</strong>
      </p>

      <div className="hint-box">
        <p>💡 Thinking about HOW you planned (not the finished project) helps you get better at planning.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="went_well">What went well in your planning?</label>
          <textarea
            id="went_well"
            placeholder="What did your team do right? What made the planning easier?"
            value={reflection.went_well || ''}
            onChange={(e) => handleReflectionChange('went_well', e.target.value)}
            rows={3}
            className={errors.went_well ? 'input-error' : ''}
          />
          <div className="char-count">
            {(reflection.went_well || '').length}/{MIN_LENGTH} characters
          </div>
          {errors.went_well && <span className="error-text">{errors.went_well}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="was_hard">What was hard to plan?</label>
          <textarea
            id="was_hard"
            placeholder="What made planning difficult? What did you struggle with?"
            value={reflection.was_hard || ''}
            onChange={(e) => handleReflectionChange('was_hard', e.target.value)}
            rows={3}
            className={errors.was_hard ? 'input-error' : ''}
          />
          <div className="char-count">
            {(reflection.was_hard || '').length}/{MIN_LENGTH} characters
          </div>
          {errors.was_hard && <span className="error-text">{errors.was_hard}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="differently">What would you do differently next time you plan?</label>
          <textarea
            id="differently"
            placeholder="What will you change? What did you learn about planning?"
            value={reflection.differently || ''}
            onChange={(e) => handleReflectionChange('differently', e.target.value)}
            rows={3}
            className={errors.differently ? 'input-error' : ''}
          />
          <div className="char-count">
            {(reflection.differently || '').length}/{MIN_LENGTH} characters
          </div>
          {errors.differently && <span className="error-text">{errors.differently}</span>}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={generateInsights}
            disabled={insightsLoading}
            className="btn-secondary"
          >
            {insightsLoading ? 'Thinking...' : '✨ Generate Insights'}
          </button>

          {insights.length > 0 && (
            <div className="insights-section">
              <h3>💡 Your Learning Insights</h3>
              <div className="insights-grid">
                {insights.map((insight, idx) => (
                  <div key={idx} className="insight-card">
                    <div className="insight-emoji">💭</div>
                    <p className="insight-text">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {badges.length > 0 && (
          <div className={`badges-section ${badgesRevealed ? 'revealed' : ''}`}>
            <h3>🏆 Badges Earned</h3>
            <div className="badges-list">
              {badges.map((badge, idx) => (
                <div key={idx} className="badge-card" style={{
                  animation: badgesRevealed ? `slideIn 0.4s ease-out ${idx * 0.1}s both` : 'none'
                }}>
                  <div className="badge-icon">{badge.emoji || '🏆'}</div>
                  <div className="badge-info">
                    <strong>{badge.name}</strong>
                    <p>{badge.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            See my project →
          </button>
        </div>
      </form>
    </div>
  );
}
