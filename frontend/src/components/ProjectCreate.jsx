import React, { useState } from 'react';
import { api } from '../utils/api';

export default function ProjectCreate({ projectState, onNext }) {
  const [title, setTitle] = useState(projectState.title || '');
  const [description, setDescription] = useState(projectState.description || '');
  const [teamMembers, setTeamMembers] = useState(projectState.teamMembers || []);
  const [newMember, setNewMember] = useState('');
  const [teamSize, setTeamSize] = useState(projectState.team_size || '1');
  const [experienceLevel, setExperienceLevel] = useState(projectState.experience_level || 'beginner');
  const [projectType, setProjectType] = useState(projectState.project_type || 'other');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAddMember = () => {
    if (newMember.trim()) {
      setTeamMembers([...teamMembers, newMember]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate on client first
    if (!title.trim()) {
      setErrors({ title: 'Give your project a name' });
      setLoading(false);
      return;
    }

    if (title.trim().length < 3) {
      setErrors({ title: 'Project name needs at least 3 letters' });
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setErrors({ description: 'Tell us what you want to make or do (at least 15 characters)' });
      setLoading(false);
      return;
    }

    if (description.trim().length < 15) {
      setErrors({ description: 'Give us more details about your project (at least 15 characters)' });
      setLoading(false);
      return;
    }

    // Validate with backend
    try {
      const validation = await api.validateProject(title, description);

      if (!validation.success || !validation.data.valid) {
        setErrors({ general: validation.data.error || 'Hmm, that project description is too vague. Tell us more!' });
        setLoading(false);
        return;
      }

      if (validation.data.warning) {
        console.warn('Warning:', validation.data.warning);
      }

      setLoading(false);

      // Fix #12: Don't hardcode 'You' - pass actual teamMembers or empty array
      onNext({
        title,
        description,
        teamMembers: teamMembers.length > 0 ? teamMembers : [],
        team_size: teamSize,
        experience_level: experienceLevel,
        project_type: projectType
      });
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      setLoading(false);
      return;
    }
  };

  return (
    <div className="step-container">
      <h2>🎯 Let's Start a Project</h2>

      <div className="hint-box">
        <p>💡 Tell us about a real project your team is working on. A school project, team assignment, creative goal - anything!</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="title">What's your project called?</label>
          <input
            id="title"
            type="text"
            placeholder="Build a game, Plan a fundraiser, Make a video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'input-error' : ''}
          />
          <div className="char-count">{title.length} characters</div>
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Tell us about it. What do you want to make or do?</label>
          <textarea
            id="description"
            placeholder="We want to build a robot that picks up tennis balls..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={errors.description ? 'input-error' : ''}
          />
          <div className="char-count">
            {description.length} characters (need at least 15)
          </div>
          {errors.description && (
            <span className="error-text">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="projectType">What type of project is this?</label>
          <select
            id="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="form-select"
          >
            <option value="web_app">Web Application</option>
            <option value="mobile_app">Mobile App</option>
            <option value="game">Game</option>
            <option value="hardware">Hardware/Robotics</option>
            <option value="creative">Creative (Art/Music/Video)</option>
            <option value="research">Research/Study</option>
            <option value="event">Event/Campaign</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="teamSize">How many people on your team?</label>
          <select
            id="teamSize"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="form-select"
          >
            <option value="1">Just me (1 person)</option>
            <option value="2-3">2-3 people</option>
            <option value="4+">4+ people</option>
          </select>
        </div>

        <div className="form-group">
          <label>How experienced is your team?</label>
          <fieldset className="form-fieldset">
            <label className="radio-label">
              <input
                type="radio"
                name="experience"
                value="beginner"
                checked={experienceLevel === 'beginner'}
                onChange={(e) => setExperienceLevel(e.target.value)}
              />
              <span>First time doing this kind of project</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="experience"
                value="intermediate"
                checked={experienceLevel === 'intermediate'}
                onChange={(e) => setExperienceLevel(e.target.value)}
              />
              <span>We've done something similar before</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="experience"
                value="advanced"
                checked={experienceLevel === 'advanced'}
                onChange={(e) => setExperienceLevel(e.target.value)}
              />
              <span>We're pretty experienced with this type of work</span>
            </label>
          </fieldset>
        </div>

        <div className="form-group">
          <label>Who's on your team?</label>
          <div className="team-input">
            <input
              type="text"
              placeholder="Enter team member name"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <button type="button" onClick={handleAddMember} className="btn-small">
              Add
            </button>
          </div>

          {teamMembers.length > 0 && (
            <div className="team-list">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="team-member">
                  <span>{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {teamMembers.length === 0 && (
            <p className="hint">Solo project? You can work alone!</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Checking...' : 'Continue →'}
        </button>
      </form>
    </div>
  );
}
