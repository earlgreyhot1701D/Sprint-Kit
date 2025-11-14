/**
 * API client for Sprint Kit
 * Handles all backend communication
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

  // Core AI endpoint - task breakdown
  breakDownTasks: async (projectGoal, projectDescription) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/break-down`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_goal: projectGoal,
          project_description: projectDescription
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Timeline validation
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
  generateReflectionInsights: async (projectTitle, reflection) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects/reflection-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
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
