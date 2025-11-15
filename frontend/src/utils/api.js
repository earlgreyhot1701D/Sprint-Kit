/**
 * API client for Sprint Kit
 * Handles all backend communication with 3-layer personalization
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    success: false,
    error: 'Something went wrong. Please try again.',
    data: null
  };
};

export const api = {
  // Validation endpoints
  validateProject: async (title, description) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  validateSuccessCriteria: async (criteria) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/validate-criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ===== LAYER 1: PROJECT TYPE DETECTION =====
  detectProjectType: async (projectTitle, projectDescription) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/detect-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_title: projectTitle,
          project_description: projectDescription
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ===== LAYER 2: TASK BREAKDOWN (Context-Aware) =====
  breakDownTasks: async (projectTitle, projectDescription, projectType, experienceLevel, teamSize) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/break-down`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_title: projectTitle,
          project_description: projectDescription,
          project_type: projectType || 'other',
          experience_level: experienceLevel || 'beginner',
          team_size: teamSize || '1'
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ===== LAYER 2B: TIMELINE ESTIMATION (Context-Aware) =====
  estimateTimeline: async (tasks, deadlineDays, experienceLevel, teamSize) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/estimate-timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          deadline_days: deadlineDays,
          experience_level: experienceLevel || 'beginner',
          team_size: teamSize || '1'
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // ===== LAYER 3: ADAPTIVE REFLECTION PROMPTS =====
  getReflectionPrompts: async (projectType, projectTitle, whatWentWell, whatWasHard, whatLearned) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/reflection-prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: projectType || 'other',
          project_title: projectTitle,
          what_went_well: whatWentWell,
          what_was_hard: whatWasHard,
          what_learned: whatLearned
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Timeline validation (legacy)
  validateTimeline: async (tasks, deadlineDate) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/validate-timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          deadline_date: deadlineDate
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Team balance
  validateTeamBalance: async (assignments) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/validate-team-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Badges
  awardBadges: async (reflectionText, tasksEdited, timelineAccuracy) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/award-badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflection_text: reflectionText,
          tasks_edited: tasksEdited,
          timeline_accuracy: timelineAccuracy
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Reflection insights
  generateReflectionInsights: async (projectTitle, projectType, reflection) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/reflection-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          project_type: projectType || 'other',
          reflection
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // PDF export
  exportPDF: async (projectData) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) throw new Error('PDF export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.title || 'project'}_plan.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  }
};
