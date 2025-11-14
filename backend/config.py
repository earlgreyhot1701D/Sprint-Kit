"""
Sprint Kit Backend Configuration
Centralized settings for safety, API, and environment.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ===== API CONFIGURATION =====
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
CLAUDE_MODEL = "claude-3-5-sonnet-20241022"
MAX_TOKENS = 1000

# ===== FLASK CONFIGURATION =====
FLASK_ENV = os.getenv("FLASK_ENV", "development")
FLASK_DEBUG = DEBUG

# ===== CHILD SAFETY CONFIGURATION =====
# These are non-negotiable boundaries for Sprint Kit

ALLOWED_PROJECT_TYPES = [
    "school project",
    "team assignment",
    "creative project",
    "science fair",
    "class presentation",
    "group work",
    "extracurricular activity"
]

DISALLOWED_KEYWORDS = [
    "homework help",
    "essay writing",
    "test answers",
    "cheating",
    "personal",
    "family",
    "relationship",
    "dating",
    "depression",
    "anxiety",
    "self-harm",
    "bullying"
]

OUT_OF_SCOPE_RESPONSE = """
I can help you plan projects for school or teams. But that question is outside 
what I'm designed for.

If you need help with:
- Homework answers → Talk to your teacher
- Personal issues → Talk to a school counselor
- Emergency → Call/text 988 (Suicide & Crisis Lifeline)

Let's get back to planning your project. What's your goal?
"""

PROMPT_INJECTION_KEYWORDS = [
    "system prompt",
    "ignore",
    "forget",
    "pretend",
    "you are now",
    "as an AI",
    "from now on",
    "role play"
]

# ===== BADGE CONFIGURATION =====
BADGE_DEFINITIONS = {
    "break_it_down": {
        "name": "I Can Break It Down",
        "description": "You learned how to split big goals into manageable tasks.",
        "trigger": "decomposition_mentioned"
    },
    "planner_power": {
        "name": "Planner Power",
        "description": "You're good at guessing how long things take!",
        "trigger": "timeline_accurate"
    },
    "team_player": {
        "name": "Team Player",
        "description": "Your teammates said you helped them. That's collaboration!",
        "trigger": "collaboration_mentioned"
    }
}

# ===== FALLBACK DATA =====
FALLBACK_TASKS = [
    {"task": "Plan your project", "hours": 2, "difficulty": "Easy"},
    {"task": "Gather resources or materials", "hours": 1, "difficulty": "Easy"},
    {"task": "Build, create, or make it", "hours": 4, "difficulty": "Medium"},
    {"task": "Test or try it out", "hours": 2, "difficulty": "Medium"},
    {"task": "Fix problems and improve", "hours": 2, "difficulty": "Hard"}
]

GENERIC_REFLECTION_INSIGHTS = [
    "You completed a project and reflected on your learning—that's what real learners do!",
    "You worked through challenges and kept going. That's persistence.",
    "You're thinking about how you work. That's metacognition, and it's powerful."
]
