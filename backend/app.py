"""
Sprint Kit Flask Application
REST API for the project planning backend.
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
    generate_tasks,
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


# ===== TASK BREAKDOWN (Core AI Feature) =====

@app.route("/api/projects/break-down", methods=["POST"])
def break_down_tasks():
    """
    Generate task breakdown using Claude.
    
    Request: {
        "project_goal": str,
        "project_description": str
    }
    
    Returns: {
        "tasks": list of {task, hours, difficulty},
        "source": "claude" or "fallback"
    }
    """
    logger.info("POST /api/projects/break-down - Task breakdown requested")
    try:
        data = request.json or {}
        goal = data.get('project_goal', '')
        description = data.get('project_description', '')
        
        if not goal or not description:
            return jsonify({"error": "Project goal and description are required"}), 400
        
        result = generate_tasks(goal, description)
        
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


# ===== TIMELINE VALIDATION =====

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
    Generate AI insights from student reflection.
    
    Request: {
        "title": str (project title),
        "reflection": {
            "went_well": str,
            "was_hard": str,
            "learned": str
        }
    }
    """
    try:
        data = request.json or {}
        title = data.get('title', 'Project')
        reflection = data.get('reflection', {})
        
        if not reflection:
            return jsonify({"error": "Reflection data missing"}), 400
        
        reflection_data = {
            "project_title": title,
            "went_well": reflection.get('went_well', ''),
            "was_hard": reflection.get('was_hard', ''),
            "learned": reflection.get('learned', '')
        }
        
        result = generate_reflection_insights(reflection_data)
        
        return jsonify(result), 200
    
    except Exception as e:
        error = handle_error_safely(e, "get_reflection_insights")
        return jsonify({
            "error": error["user_message"],
            "insights": []
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
