"""
Sprint Kit Flask Application
REST API for the project planning backend.
UPDATED: reflection-insights endpoint now handles NEW format (prompts + answers).
"""

import logging
from io import BytesIO
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from config import FLASK_DEBUG, FLASK_ENV
from safety import handle_error_safely
from core_logic import (
    validate_project,
    validate_success_criteria,
    validate_timeline,
    validate_team_balance,
    award_badges
)
from utils import (
    detect_project_type,
    generate_tasks_with_context,
    estimate_timeline_with_context,
    generate_adaptive_reflection_prompts,
    generate_reflection_insights,
    export_project_to_pdf
)

# Setup logging
logging.basicConfig(
    level=logging.DEBUG if FLASK_DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)
app.config['JSON_SORT_KEYS'] = False


# ===== HEALTH CHECK =====

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return jsonify({"status": "ok", "environment": FLASK_ENV}), 200


# ===== PROJECT CREATION & VALIDATION =====

@app.route("/api/projects/validate", methods=["POST"])
def validate_project_endpoint():
    """
    Validate project title and description.

    Request: {
        "title": str,
        "description": str
    }
    """
    try:
        data = request.json or {}
        title = data.get('title', '')
        description = data.get('description', '')

        result = validate_project(title, description)

        return jsonify({
            "valid": result["valid"],
            "error": result["error"],
            "warning": result["warning"]
        }), 200

    except Exception as e:
        error = handle_error_safely(e, "validate_project_endpoint")
        return jsonify({"error": error["user_message"]}), 500


# ===== LAYER 1: PROJECT TYPE DETECTION =====

@app.route("/api/projects/detect-type", methods=["POST"])
def detect_type():
    """
    Detect project type (hardware, software, creative, event, research, other).

    Request: {
        "project_title": str,
        "project_description": str
    }

    Returns: {
        "type": str,
        "success": bool
    }
    """
    logger.info("POST /api/projects/detect-type - Type detection requested")
    try:
        data = request.json or {}
        title = data.get('project_title', '')
        description = data.get('project_description', '')

        if not title or not description:
            return jsonify({
                "error": "Project title and description required",
                "type": "other",
                "success": False
            }), 400

        project_type = detect_project_type(title, description)

        return jsonify({
            "type": project_type,
            "success": True
        }), 200

    except Exception as e:
        error = handle_error_safely(e, "detect_type")
        logger.error(f"Type detection error: {error['internal_error']}")
        return jsonify({
            "error": error["user_message"],
            "type": "other",
            "success": False
        }), 500


# ===== LAYER 2: TASK BREAKDOWN (Context-Aware) =====

@app.route("/api/projects/break-down", methods=["POST"])
def break_down_tasks():
    """
    Generate task breakdown using Claude with context (type, experience, team size).

    Request: {
        "project_title": str,
        "project_description": str,
        "project_type": str (from Layer 1),
        "experience_level": str (beginner/intermediate/advanced),
        "team_size": str (1/2-3/4+),
        "goal": str (student's stated goal),
        "brainstorm_ideas": str (student's brainstorm ideas)
    }

    Returns: {
        "tasks": list of {task, hours, difficulty},
        "source": "claude" or "fallback",
        "message": str or null
    }
    """
    logger.info("POST /api/projects/break-down - Task breakdown requested")
    try:
        data = request.json or {}
        title = data.get('project_title', '')
        description = data.get('project_description', '')
        project_type = data.get('project_type', 'other')
        experience_level = data.get('experience_level', 'beginner')
        team_size = data.get('team_size', '1')
        goal = data.get('goal', '')
        brainstorm_ideas = data.get('brainstorm_ideas', '')

        if not title or not description:
            return jsonify({
                "error": "Project title and description required",
                "tasks": [],
                "source": "fallback"
            }), 400

        result = generate_tasks_with_context(
            project_title=title,
            project_description=description,
            project_type=project_type,
            experience_level=experience_level,
            team_size=team_size,
            goal=goal,
            brainstorm_ideas=brainstorm_ideas
        )

        return jsonify({
            "tasks": result["tasks"],
            "source": result["source"],
            "message": result["message"]
        }), 200

    except Exception as e:
        error = handle_error_safely(e, "break_down_tasks")
        logger.error(f"Task breakdown error: {error['internal_error']}")
        return jsonify({
            "error": error["user_message"],
            "tasks": [],
            "source": "fallback"
        }), 500


# ===== LAYER 2B: TIMELINE ESTIMATION (Context-Aware) =====

@app.route("/api/projects/estimate-timeline", methods=["POST"])
def estimate_timeline():
    """
    Estimate if timeline is realistic based on experience and team size.

    Request: {
        "tasks": list of {hours: int},
        "deadline_days": int,
        "experience_level": str (beginner/intermediate/advanced),
        "team_size": str (1/2-3/4+)
    }

    Returns: {
        "total_hours": int,
        "available_hours": int,
        "realistic": bool,
        "status": str,
        "message": str,
        "suggestion": str or null
    }
    """
    logger.info("POST /api/projects/estimate-timeline - Timeline estimation requested")
    try:
        data = request.json or {}
        tasks = data.get('tasks', [])
        deadline_days = data.get('deadline_days', 7)
        experience_level = data.get('experience_level', 'beginner')
        team_size = data.get('team_size', '1')

        if not tasks:
            return jsonify({
                "error": "Tasks list required",
                "total_hours": 0,
                "available_hours": 0,
                "realistic": False
            }), 400

        result = estimate_timeline_with_context(
            tasks=tasks,
            deadline_days=deadline_days,
            experience_level=experience_level,
            team_size=team_size
        )

        return jsonify(result), 200

    except Exception as e:
        error = handle_error_safely(e, "estimate_timeline")
        logger.error(f"Timeline estimation error: {error['internal_error']}")
        return jsonify({
            "error": error["user_message"],
            "total_hours": 0,
            "available_hours": 0,
            "realistic": False
        }), 500


# ===== LAYER 3: ADAPTIVE REFLECTION PROMPTS =====

@app.route("/api/projects/reflection-prompts", methods=["POST"])
def get_reflection_prompts():
    """
    Generate custom reflection prompts based on student's project.

    Request: {
        "project_type": str,
        "project_title": str,
        "what_went_well": str,
        "what_was_hard": str,
        "what_learned": str
    }

    Returns: {
        "prompts": list of 3 custom prompts,
        "source": "claude" or "generic"
    }
    """
    logger.info("POST /api/projects/reflection-prompts - Custom prompts requested")
    try:
        data = request.json or {}
        project_type = data.get('project_type', 'other')
        project_title = data.get('project_title', 'Project')
        what_went_well = data.get('what_went_well', '')
        what_was_hard = data.get('what_was_hard', '')
        what_learned = data.get('what_learned', '')

        result = generate_adaptive_reflection_prompts(
            project_type=project_type,
            project_title=project_title,
            what_went_well=what_went_well,
            what_was_hard=what_was_hard,
            what_learned=what_learned
        )

        return jsonify(result), 200

    except Exception as e:
        error = handle_error_safely(e, "get_reflection_prompts")
        logger.error(f"Reflection prompts error: {error['internal_error']}")
        return jsonify({
            "error": error["user_message"],
            "prompts": [
                "What went well with your project?",
                "What was challenging?",
                "What did you learn?"
            ],
            "source": "generic"
        }), 500


# ===== TIMELINE VALIDATION (Legacy) =====

@app.route("/api/projects/validate-timeline", methods=["POST"])
def validate_timeline_endpoint():
    """
    Validate project timeline and budget.

    Request: {
        "tasks": list of {hours: int},
        "deadline_date": ISO date string
    }
    """
    try:
        data = request.json or {}
        tasks = data.get('tasks', [])
        deadline = data.get('deadline_date', '')

        if not deadline:
            return jsonify({"error": "Deadline date is required"}), 400

        result = validate_timeline(tasks, deadline)

        return jsonify(result), 200

    except Exception as e:
        error = handle_error_safely(e, "validate_timeline_endpoint")
        return jsonify({"error": error["user_message"]}), 500


# ===== TEAM BALANCE =====

@app.route("/api/projects/validate-team-balance", methods=["POST"])
def validate_team_endpoint():
    """
    Validate that team work is balanced.

    Request: {
        "assignments": {task_id: person_name, ...}
    }
    """
    try:
        data = request.json or {}
        assignments = data.get('assignments', {})

        result = validate_team_balance(assignments)

        return jsonify(result), 200

    except Exception as e:
        error = handle_error_safely(e, "validate_team_endpoint")
        return jsonify({"error": error["user_message"]}), 500


# ===== BADGES & REFLECTION =====

@app.route("/api/projects/award-badges", methods=["POST"])
def award_badges_endpoint():
    """
    Award badges based on reflection and performance.

    Request: {
        "reflection_text": str,
        "tasks_edited": bool,
        "timeline_accuracy": float (0.5 to 2.0)
    }
    """
    try:
        data = request.json or {}
        reflection_text = data.get('reflection_text', '')
        tasks_edited = data.get('tasks_edited', False)
        timeline_accuracy = data.get('timeline_accuracy', 1.0)

        badges = award_badges(reflection_text, tasks_edited, timeline_accuracy)

        return jsonify({"badges": badges}), 200

    except Exception as e:
        error = handle_error_safely(e, "award_badges_endpoint")
        return jsonify({
            "error": error["user_message"],
            "badges": []
        }), 500


@app.route("/api/projects/reflection-insights", methods=["POST"])
def get_reflection_insights():
    """
    Generate AI insights from student reflection AND award badges.
    Supports both NEW format (reflection.prompts + reflection.answers) and OLD format (went_well/was_hard/learned).

    Request (NEW format): {
        "title": str (project title),
        "project_type": str,
        "reflection": {
            "prompts": [list of prompts],
            "answers": [list of answers]
        },
        "tasks_edited": bool (optional, default False),
        "timeline_accuracy": float (optional, default 1.0)
    }

    Request (OLD format): {
        "title": str (project title),
        "project_type": str,
        "reflection": {
            "went_well": str,
            "was_hard": str,
            "learned": str
        },
        "tasks_edited": bool (optional, default False),
        "timeline_accuracy": float (optional, default 1.0)
    }

    Returns: {
        "insights": [...],
        "badges": [...],
        "source": "claude" or "generic"
    }
    """
    try:
        data = request.json or {}
        title = data.get('title', 'Project')
        project_type = data.get('project_type', 'other')
        reflection = data.get('reflection', {})
        tasks_edited = data.get('tasks_edited', False)
        timeline_accuracy = data.get('timeline_accuracy', 1.0)

        if not reflection:
            return jsonify({"error": "Reflection data missing"}), 400

        # Handle NEW format: reflection.prompts + reflection.answers
        if 'prompts' in reflection and 'answers' in reflection:
            prompts = reflection.get('prompts', [])
            answers = reflection.get('answers', [])

            # Fix #10: Safely join answers, converting to strings and filtering None
            # Combine answers into a single reflection text for Claude analysis
            combined_reflection = " ".join(str(a) for a in answers if a) if answers else ""

            reflection_data = {
                "project_title": title,
                "project_type": project_type,
                "went_well": combined_reflection,  # Map to old keys for generate_reflection_insights
                "was_hard": combined_reflection,
                "learned": combined_reflection
            }

            # Generate badges using NEW format (prompts + answers)
            badges = award_badges(
                reflection_prompts=prompts,
                reflection_answers=answers,
                tasks_edited=tasks_edited,
                timeline_accuracy=timeline_accuracy
            )
        # Handle OLD format: went_well/was_hard/learned
        else:
            reflection_data = {
                "project_title": title,
                "project_type": project_type,
                "went_well": reflection.get('went_well', ''),
                "was_hard": reflection.get('was_hard', ''),
                "learned": reflection.get('learned', '')
            }

            # Generate badges using OLD format (reflection_text)
            combined_old_reflection = f"{reflection.get('went_well', '')} {reflection.get('was_hard', '')} {reflection.get('learned', '')}"
            badges = award_badges(
                reflection_prompts=None,
                reflection_answers=None,
                tasks_edited=tasks_edited,
                timeline_accuracy=timeline_accuracy,
                reflection_text=combined_old_reflection
            )

        # Generate insights
        result = generate_reflection_insights(reflection_data)

        # Add badges to the result
        result['badges'] = badges

        return jsonify(result), 200

    except Exception as e:
        error = handle_error_safely(e, "get_reflection_insights")
        return jsonify({
            "error": error["user_message"],
            "insights": [],
            "badges": []
        }), 500


# ===== EXPORT =====

@app.route("/api/projects/export-pdf", methods=["POST"])
def export_pdf():
    """
    Export project as PDF.

    Request: Complete project data dict
    """
    try:
        data = request.json or {}

        if not data.get('title'):
            return jsonify({"error": "Project title required"}), 400

        # Generate PDF
        pdf_bytes = export_project_to_pdf(data)

        # Return as downloadable file
        return send_file(
            BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{data.get('title', 'project')}_plan.pdf"
        )

    except Exception as e:
        error = handle_error_safely(e, "export_pdf")
        logger.error(f"PDF export error: {error['internal_error']}")
        return jsonify({"error": error["user_message"]}), 500


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    """404 error handler."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """500 error handler."""
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


# ===== RUN SERVER =====

if __name__ == "__main__":
    logger.info(f"Starting Sprint Kit server (environment: {FLASK_ENV})")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=FLASK_DEBUG,
        use_reloader=False
    )
