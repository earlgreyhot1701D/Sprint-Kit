"""
Core business logic for Sprint Kit.
Validation functions and badge logic.
No external dependencies - pure logic.
UPDATED: Badge logic now analyzes actual reflection answers, not generic keywords.
"""

import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def validate_project(title: str, description: str) -> dict:
    """
    Validate that a project is meaningful and not just jargon.

    Args:
        title: Project name (must be 3+ chars)
        description: Project description (must be 10+ chars)

    Returns:
        {
            "valid": bool - True if passes validation,
            "error": str or None - Error message if invalid,
            "warning": str or None - Warning if contains jargon
        }
    """
    errors = []
    warnings = []

    # Check title length
    if not title or len(title.strip()) < 3:
        errors.append("Project name needs to be at least 3 characters")

    # Check description length
    if not description or len(description.strip()) < 10:
        errors.append("Tell us more about your project!")

    # Flag overly technical jargon (not age-appropriate)
    jargon_words = ["synergy", "stakeholder", "deliverable", "paradigm", "leverage", "optimization"]
    description_lower = description.lower()
    jargon_found = [w for w in jargon_words if w in description_lower]
    if jargon_found:
        warnings.append(f"Try using simpler words instead of '{jargon_found[0]}'")

    return {
        "valid": len(errors) == 0,
        "error": errors[0] if errors else None,
        "warning": warnings[0] if warnings else None
    }


def validate_task_clarity(task_description: str) -> dict:
    """
    Ensure tasks are clear and actionable, not vague.

    Args:
        task_description: The task description to validate

    Returns:
        {"clear": bool, "reason": str or None}
    """
    if not task_description or len(task_description.strip()) < 5:
        return {"clear": False, "reason": "Task description is too short"}

    # Check for action verbs (students should DO something)
    action_verbs = [
        "build", "make", "test", "draw", "write", "create",
        "plan", "research", "code", "design", "collect", "assemble",
        "fix", "improve", "review", "check", "organize"
    ]

    task_lower = task_description.lower()
    has_action = any(verb in task_lower for verb in action_verbs)

    if not has_action:
        return {
            "clear": False,
            "reason": "Task should describe something specific to DO (e.g., 'Build the frame')"
        }

    # Check for vague qualifiers
    vague_words = ["good", "nice", "awesome", "cool", "better", "stuff", "thing"]
    is_vague = any(word in task_lower for word in vague_words)

    if is_vague:
        return {"clear": False, "reason": "Use specific words instead of vague descriptions"}

    return {"clear": True, "reason": None}


def validate_success_criteria(criteria_text: str) -> dict:
    """
    Check that success criteria is observable, not vague.

    Returns: {"valid": bool, "error": str or None, "warning": str or None}
    """
    if not criteria_text or len(criteria_text.strip()) < 10:
        return {"valid": False, "error": "Success criteria needs more detail"}

    specificity_score = len(criteria_text.split())

    if specificity_score < 5:
        return {
            "valid": False,
            "error": "Tell us more about what 'done' looks like"
        }

    # Check for action/observable words
    action_words = ["test", "show", "make", "finish", "work", "complete", "demonstrate", "measure"]
    has_action = any(word in criteria_text.lower() for word in action_words)

    if not has_action:
        return {
            "valid": False,
            "error": "What will you actually DO to know it's done?"
        }

    return {"valid": True, "error": None, "warning": None}


def validate_timeline(tasks: list, deadline_date: str) -> dict:
    """
    Check if timeline is realistic.

    Args:
        tasks: List of dicts with 'hours' key
        deadline_date: ISO format date string

    Returns: {
        "status": "good/tight/too_tight",
        "total_hours": int,
        "available_hours": int,
        "message": str
    }
    """
    try:
        # Fix #9: Safely convert hours to float with error handling
        # Validate that all tasks have positive hours
        for task in tasks:
            try:
                hours = float(task.get('hours', 0))
            except (ValueError, TypeError):
                return {
                    "status": "error",
                    "total_hours": 0,
                    "available_hours": 0,
                    "message": "Invalid task hours. Please enter valid numbers.",
                    "realistic": False
                }
            if hours <= 0:
                return {
                    "status": "error",
                    "total_hours": 0,
                    "available_hours": 0,
                    "message": "All tasks must have at least 1 hour of work.",
                    "realistic": False
                }

        # Calculate total work hours with safe conversion
        def safe_hours(task):
            try:
                return float(task.get('hours', 0))
            except (ValueError, TypeError):
                return 0

        total_hours = sum(safe_hours(task) for task in tasks)

        # Parse deadline
        deadline = datetime.fromisoformat(deadline_date)
        now = datetime.now()

        # Check if deadline is in the past
        if deadline < now:
            return {
                "status": "error",
                "total_hours": int(total_hours),
                "available_hours": 0,
                "message": "Your deadline is in the past! Pick a future date.",
                "realistic": False
            }

        days_available = max((deadline - now).days, 1)  # At least 1 day

        # Assume 2 hours max per day for school work
        hours_per_day = 2
        available_hours = days_available * hours_per_day

        # Determine status
        if total_hours <= available_hours * 0.5:
            status = "good"
            message = f"You have {available_hours - total_hours:.0f} extra hours. Good planning!"
        elif total_hours <= available_hours:
            status = "tight"
            message = f"That's {total_hours} hours of work in {available_hours} available hours. Tight, but doable!"
        else:
            status = "too_tight"
            message = f"That's {total_hours} hours of work, but only {available_hours} available. You might need more time or help."

        return {
            "status": status,
            "total_hours": int(total_hours),
            "available_hours": int(available_hours),
            "message": message,
            "realistic": status in ["good", "tight"]
        }

    except Exception as e:
        logger.error(f"Timeline validation error: {e}")
        return {
            "status": "unknown",
            "total_hours": 0,
            "available_hours": 0,
            "message": "Could not calculate timeline",
            "realistic": False
        }


def validate_team_balance(assignments: dict) -> dict:
    """
    Check that work is distributed fairly across team.

    Args:
        assignments: Dict of {task_id: person_name, ...}

    Returns: {
        "balanced": bool,
        "warning": str or None,
        "suggestion": str or None
    }
    """
    if not assignments:
        return {"balanced": True, "warning": None, "suggestion": None}

    # Count work per person
    work_per_person = {}
    for person in assignments.values():
        work_per_person[person] = work_per_person.get(person, 0) + 1

    if not work_per_person:
        return {"balanced": True, "warning": None, "suggestion": None}

    max_work = max(work_per_person.values())
    min_work = min(work_per_person.values())

    # If someone has 50% more work than others
    if max_work > min_work * 1.5:
        person_with_max = max(work_per_person, key=work_per_person.get)
        return {
            "balanced": False,
            "warning": f"{person_with_max} has way more tasks. Is that fair?",
            "suggestion": "Try moving tasks around so everyone has similar work."
        }

    return {"balanced": True, "warning": None, "suggestion": None}


def award_badges(reflection_prompts: list = None, reflection_answers: list = None, tasks_edited: bool = False, timeline_accuracy: float = 1.0, reflection_text: str = '') -> list:
    """
    Award badges based on actual learning + execution.

    Analyzes reflection_answers (NEW format) to determine if student demonstrated real learning.
    Falls back to reflection_text (OLD format) for backward compatibility.

    Args:
        reflection_prompts: List of custom reflection prompts (NEW)
        reflection_answers: List of answers indexed to prompts (NEW)
        tasks_edited: Whether student edited the AI-generated tasks
        timeline_accuracy: Ratio of actual to estimated time (0.8-1.2 = good)
        reflection_text: Old format fallback (for backward compatibility)

    Returns: List of badge dicts with name, reason, emoji
    """
    badges = []

    # NEW: Use custom prompts + answers if available
    # This is the NEW flow - prompts are specific to project, so we analyze answers
    if reflection_prompts and reflection_answers:
        combined_reflection = " ".join(reflection_answers) if reflection_answers else ""
        combined_reflection_lower = combined_reflection.lower()

        # Badge 1: "I Can Break It Down"
        # Awarded if: Student mentions tasks, steps, decomposition, or edited tasks
        decomp_keywords = ["break", "task", "step", "smaller", "split", "chunk", "pieces", "break down", "divided"]
        if (tasks_edited or any(kw in combined_reflection_lower for kw in decomp_keywords)) and len(combined_reflection) > 20:
            if not any(b["name"] == "I Can Break It Down" for b in badges):
                badges.append({
                    "name": "I Can Break It Down",
                    "reason": "You learned how to split big goals into manageable tasks.",
                    "emoji": "🧩"
                })

        # Badge 3: "Team Player"
        # Awarded if: Student mentions teamwork, collaboration, helping others
        collab_keywords = ["team", "together", "helped", "worked with", "partner", "group", "collaborated", "coordinated", "communicated", "teammate"]
        if any(kw in combined_reflection_lower for kw in collab_keywords) and len(combined_reflection) > 20:
            if not any(b["name"] == "Team Player" for b in badges):
                badges.append({
                    "name": "Team Player",
                    "reason": "Your teamwork and collaboration made the difference!",
                    "emoji": "👥"
                })

    # OLD: Fallback for backward compatibility (if no custom prompts)
    # This keeps the app working with old-format reflection data
    elif reflection_text:
        reflection_lower = reflection_text.lower()

        decomposition_keywords = ["break", "task", "step", "smaller", "split", "chunk", "pieces", "break down", "divided"]
        if tasks_edited or any(kw in reflection_lower for kw in decomposition_keywords):
            badges.append({
                "name": "I Can Break It Down",
                "reason": "You learned how to split big goals into manageable tasks.",
                "emoji": "🧩"
            })

        collaboration_keywords = ["team", "together", "helped", "worked with", "partner", "group", "collaborated", "coordinated", "communicated", "teammate"]
        if any(kw in reflection_lower for kw in collaboration_keywords):
            badges.append({
                "name": "Team Player",
                "reason": "Your teamwork and collaboration made the difference!",
                "emoji": "👥"
            })

    # Badge 2: "Planner Power" (independent, works same way)
    # Awarded if: timeline estimate was accurate (within 20%)
    if 0.8 <= timeline_accuracy <= 1.2:
        badges.append({
            "name": "Planner Power",
            "reason": "You're good at guessing how long things take!",
            "emoji": "⏰"
        })

    return badges


def get_badge_feedback(badges: list) -> str:
    """
    Generate encouraging feedback based on badges earned.

    Returns: Feedback string
    """
    if not badges:
        return "You completed a project and reflected on your learning. That's what real learners do!"

    if len(badges) == 1:
        return f"You earned a badge: {badges[0]['name']}. Great job!"

    if len(badges) >= 3:
        return "You earned all 3 badges! You're a project planning expert! ðŸ†"

    return f"You earned {len(badges)} badges. Keep building these skills!"
