"""
Tests for Sprint Kit core logic.
pytest test file - run with: pytest tests/test_core_logic.py -v
"""

import pytest
from datetime import datetime, timedelta
from core_logic import (
    validate_project,
    validate_task_clarity,
    validate_success_criteria,
    validate_timeline,
    validate_team_balance,
    award_badges
)


class TestProjectValidation:
    """Test project creation validation."""
    
    def test_valid_project(self):
        """Valid project should pass validation."""
        result = validate_project("Build a Robot", "We want to build a robot that picks up tennis balls")
        assert result["valid"] == True
        assert result["error"] is None
    
    def test_project_title_too_short(self):
        """Project title that's too short should fail."""
        result = validate_project("A", "Long description here")
        assert result["valid"] == False
        assert "at least 3" in result["error"].lower()
    
    def test_project_description_too_short(self):
        """Project description that's too short should fail."""
        result = validate_project("Build a Robot", "Short")
        assert result["valid"] == False
        assert "more" in result["error"].lower()
    
    def test_jargon_warning(self):
        """Project with jargon should generate warning."""
        result = validate_project(
            "Synergy Project",
            "We want to leverage synergistic stakeholder deliverables"
        )
        assert result["warning"] is not None


class TestTaskClarity:
    """Test task description clarity."""
    
    def test_clear_task(self):
        """Clear task with action verb should pass."""
        result = validate_task_clarity("Build the robot frame")
        assert result["clear"] == True
    
    def test_vague_task(self):
        """Vague task should fail."""
        result = validate_task_clarity("Do stuff")
        assert result["clear"] == False
    
    def test_task_without_action(self):
        """Task without action verb should fail."""
        result = validate_task_clarity("The robot")
        assert result["clear"] == False


class TestSuccessCriteria:
    """Test success criteria validation."""
    
    def test_valid_criteria(self):
        """Valid criteria should pass."""
        result = validate_success_criteria("We will test the robot 3 times and it will pick up 10 balls")
        assert result["valid"] == True
    
    def test_criteria_too_short(self):
        """Criteria that's too short should fail."""
        result = validate_success_criteria("Good")
        assert result["valid"] == False
    
    def test_criteria_without_action(self):
        """Criteria without observable action should fail."""
        result = validate_success_criteria("The robot will be awesome and cool")
        assert result["valid"] == False


class TestTimeline:
    """Test timeline validation."""
    
    def test_realistic_timeline(self):
        """Realistic timeline should be marked as good."""
        tasks = [
            {"hours": 2},
            {"hours": 2},
            {"hours": 2}
        ]
        deadline = (datetime.now() + timedelta(days=7)).isoformat()
        
        result = validate_timeline(tasks, deadline)
        assert result["realistic"] == True
        assert result["status"] in ["good", "tight"]
    
    def test_tight_timeline(self):
        """Very tight timeline should be flagged."""
        tasks = [
            {"hours": 10},
            {"hours": 10},
            {"hours": 10}
        ]
        deadline = (datetime.now() + timedelta(days=2)).isoformat()
        
        result = validate_timeline(tasks, deadline)
        assert result["status"] in ["tight", "too_tight"]
    
    def test_impossible_timeline(self):
        """Impossible timeline should be marked as unrealistic."""
        tasks = [{"hours": 100}]
        deadline = (datetime.now() + timedelta(hours=1)).isoformat()
        
        result = validate_timeline(tasks, deadline)
        assert result["realistic"] == False


class TestTeamBalance:
    """Test team workload distribution."""
    
    def test_balanced_team(self):
        """Balanced workload should pass."""
        assignments = {
            "task1": "Alex",
            "task2": "Alex",
            "task3": "Jordan",
            "task4": "Jordan"
        }
        result = validate_team_balance(assignments)
        assert result["balanced"] == True
    
    def test_unbalanced_team(self):
        """Unbalanced workload should be flagged."""
        assignments = {
            "task1": "Alex",
            "task2": "Alex",
            "task3": "Alex",
            "task4": "Jordan"
        }
        result = validate_team_balance(assignments)
        assert result["balanced"] == False
        assert result["warning"] is not None


class TestBadges:
    """Test badge award logic."""
    
    def test_decomposition_badge(self):
        """Should award decomposition badge for task editing."""
        reflection = "I learned how to break down the project into smaller steps"
        badges = award_badges(reflection, tasks_edited=True)
        
        badge_names = [b["name"] for b in badges]
        assert "I Can Break It Down" in badge_names
    
    def test_planner_badge_accurate_timeline(self):
        """Should award planner badge for accurate timeline."""
        reflection = "We finished on time"
        badges = award_badges(reflection, tasks_edited=False, timeline_accuracy=0.95)
        
        badge_names = [b["name"] for b in badges]
        assert "Planner Power" in badge_names
    
    def test_team_player_badge(self):
        """Should award team player badge for collaboration."""
        reflection = "Our team worked together really well and helped each other"
        badges = award_badges(reflection, tasks_edited=False)
        
        badge_names = [b["name"] for b in badges]
        assert "Team Player" in badge_names
    
    def test_no_badges(self):
        """Should not award badges if criteria not met."""
        reflection = "It was okay"
        badges = award_badges(reflection, tasks_edited=False, timeline_accuracy=2.0)
        
        assert len(badges) == 0
    
    def test_multiple_badges(self):
        """Should award multiple badges if earned."""
        reflection = "We broke it down into steps and worked together as a team"
        badges = award_badges(reflection, tasks_edited=True, timeline_accuracy=0.9)
        
        assert len(badges) >= 2
