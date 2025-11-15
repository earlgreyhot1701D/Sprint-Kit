import React, { useState } from 'react';

export default function Brainstorm({ projectState, onNext, onBack }) {
  // Fix #2: Prevent crash if brainstormIdeas is undefined
  const [brainstormIdeas, setBrainstormIdeas] = useState(
    projectState.brainstormIdeas?.join('\n') || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brainstormIdeas.trim()) {
      alert('Please write down some ideas!');
      return;
    }

    const ideas = brainstormIdeas
      .split('\n')
      .map((idea) => idea.trim())
      .filter((idea) => idea.length > 0);

    onNext({ brainstormIdeas: ideas });
  };

  return (
    <div className="step-container">
      <h2>💡 Brainstorm: Different Approaches</h2>

      <div className="hint-box">
        <p>💡 Just write down ideas. No idea is bad. Don't worry about whether it's possible yet.</p>
        <p>💡 Write ideas fast. Don't stop to judge them. Think: different materials, different steps, different ways to test it.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="ideas">What are 3-5 different ways to approach your project?</label>
          <div className="hint">
            Example: "Use wood instead of plastic" or "Build it step-by-step vs all at once" or "Test it with 5 people vs 1"
          </div>
          <textarea
            id="ideas"
            placeholder="Make it from wood&#10;Try a different design&#10;Use a simpler method&#10;Get help from the team&#10;Test it twice"
            value={brainstormIdeas}
            onChange={(e) => setBrainstormIdeas(e.target.value)}
            rows={6}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
