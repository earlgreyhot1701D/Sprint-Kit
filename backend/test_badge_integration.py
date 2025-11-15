"""
Comprehensive Badge Logic Integration Tests
Tests all three badge conditions end-to-end.
"""

import sys
sys.path.insert(0, '/home/user/Sprint-Kit/backend')

from core_logic import award_badges


def test_badge_1_break_it_down():
    """Test Badge 1: 'I Can Break It Down' - awarded for decomposition"""
    print("\n=== TEST 1: Badge 1 - 'I Can Break It Down' ===")

    # Test Case 1a: Reflection mentions "breaking down tasks"
    prompts = [
        "How did you organize your project?",
        "What was challenging?",
        "What did you learn?"
    ]
    answers = [
        "I broke down the project into smaller tasks and worked on each one step by step",
        "Managing time was hard",
        "I learned to plan better"
    ]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "I Can Break It Down" in badge_names, "Badge 1 should be awarded for mentioning decomposition"
    print("✅ PASS: Badge awarded for mentioning 'broke down'")

    # Test Case 1b: Student edited tasks (alternative trigger)
    prompts = ["Q1", "Q2", "Q3"]
    answers = ["No decomposition mentioned", "Something else", "Another thing"]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=True,  # ← This should trigger the badge
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "I Can Break It Down" in badge_names, "Badge 1 should be awarded when tasks_edited=True"
    print("✅ PASS: Badge awarded for editing tasks")

    # Test Case 1c: Neither condition met (should NOT award badge)
    prompts = ["Q1", "Q2", "Q3"]
    answers = ["No keywords here", "Nothing relevant", "Just generic stuff"]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "I Can Break It Down" not in badge_names, "Badge 1 should NOT be awarded without triggers"
    print("✅ PASS: Badge NOT awarded when conditions not met")


def test_badge_2_planner_power():
    """Test Badge 2: 'Planner Power' - awarded for accurate timeline estimates"""
    print("\n=== TEST 2: Badge 2 - 'Planner Power' ===")

    prompts = ["Q1", "Q2", "Q3"]
    answers = ["Answer 1", "Answer 2", "Answer 3"]

    # Test Case 2a: Perfect estimate (1.0)
    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "Planner Power" in badge_names, "Badge 2 should be awarded for timeline_accuracy=1.0"
    print("✅ PASS: Badge awarded for perfect estimate (1.0)")

    # Test Case 2b: Good estimate (0.9)
    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=0.9
    )

    badge_names = [b['name'] for b in badges]
    assert "Planner Power" in badge_names, "Badge 2 should be awarded for timeline_accuracy=0.9"
    print("✅ PASS: Badge awarded for good estimate (0.9)")

    # Test Case 2c: Accurate but slightly over (1.15)
    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.15
    )

    badge_names = [b['name'] for b in badges]
    assert "Planner Power" in badge_names, "Badge 2 should be awarded for timeline_accuracy=1.15"
    print("✅ PASS: Badge awarded for slightly over estimate (1.15)")

    # Test Case 2d: Poor estimate (2.0 - should NOT award)
    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=2.0
    )

    badge_names = [b['name'] for b in badges]
    assert "Planner Power" not in badge_names, "Badge 2 should NOT be awarded for timeline_accuracy=2.0"
    print("✅ PASS: Badge NOT awarded for poor estimate (2.0)")

    # Test Case 2e: Very early completion (0.5 - should NOT award)
    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=0.5
    )

    badge_names = [b['name'] for b in badges]
    assert "Planner Power" not in badge_names, "Badge 2 should NOT be awarded for timeline_accuracy=0.5"
    print("✅ PASS: Badge NOT awarded for very early completion (0.5)")


def test_badge_3_team_player():
    """Test Badge 3: 'Team Player' - awarded for collaboration"""
    print("\n=== TEST 3: Badge 3 - 'Team Player' ===")

    # Test Case 3a: Reflection mentions teamwork
    prompts = [
        "How did your team work together?",
        "What was challenging?",
        "What did you learn?"
    ]
    answers = [
        "Our team collaborated really well and helped each other throughout the project",
        "Time management was hard",
        "I learned the value of teamwork"
    ]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "Team Player" in badge_names, "Badge 3 should be awarded for mentioning collaboration"
    print("✅ PASS: Badge awarded for mentioning 'collaborated' and 'teamwork'")

    # Test Case 3b: Different collaboration keywords
    answers = [
        "We worked together as a group and coordinated our efforts",
        "Communication was important",
        "Working with my teammates taught me a lot"
    ]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "Team Player" in badge_names, "Badge 3 should be awarded for 'worked together' and 'teammates'"
    print("✅ PASS: Badge awarded for different collaboration keywords")

    # Test Case 3c: No teamwork mentioned (should NOT award)
    answers = [
        "I did everything myself",
        "It was okay",
        "I learned some stuff"
    ]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert "Team Player" not in badge_names, "Badge 3 should NOT be awarded without teamwork keywords"
    print("✅ PASS: Badge NOT awarded when no teamwork mentioned")


def test_multiple_badges():
    """Test earning multiple badges at once"""
    print("\n=== TEST 4: Multiple Badges ===")

    prompts = ["Q1", "Q2", "Q3"]
    answers = [
        "I broke down the project into tasks and worked with my team to complete them",
        "Time management and coordination were challenging",
        "I learned about decomposition and collaboration"
    ]

    # This should earn all 3 badges:
    # - Badge 1: mentions "broke down" and "tasks"
    # - Badge 2: timeline_accuracy=1.0
    # - Badge 3: mentions "team" and "collaboration"
    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=True,
        timeline_accuracy=1.0
    )

    badge_names = [b['name'] for b in badges]
    assert len(badges) == 3, f"Should earn all 3 badges, but got {len(badges)}"
    assert "I Can Break It Down" in badge_names
    assert "Planner Power" in badge_names
    assert "Team Player" in badge_names
    print("✅ PASS: All 3 badges awarded when all conditions met")

    # Verify badge structure
    for badge in badges:
        assert 'name' in badge, "Badge must have 'name' field"
        assert 'reason' in badge, "Badge must have 'reason' field"
        assert 'emoji' in badge, "Badge must have 'emoji' field"
        assert len(badge['reason']) > 10, "Badge reason should be meaningful"
    print("✅ PASS: All badges have correct structure (name, reason, emoji)")


def test_no_badges():
    """Test earning zero badges"""
    print("\n=== TEST 5: No Badges ===")

    prompts = ["Q1", "Q2", "Q3"]
    answers = [
        "It was fine",
        "Nothing special",
        "Just okay"
    ]

    badges = award_badges(
        reflection_prompts=prompts,
        reflection_answers=answers,
        tasks_edited=False,
        timeline_accuracy=2.5  # Poor estimate
    )

    assert badges == [], f"Should earn 0 badges, but got {len(badges)}"
    print("✅ PASS: No badges awarded when no conditions met")


def test_backward_compatibility():
    """Test OLD format (reflection_text) still works"""
    print("\n=== TEST 6: Backward Compatibility (OLD format) ===")

    # OLD format: single reflection_text string
    reflection_text = "I broke down the project into tasks and worked with my team"

    badges = award_badges(
        reflection_prompts=None,
        reflection_answers=None,
        tasks_edited=False,
        timeline_accuracy=1.0,
        reflection_text=reflection_text
    )

    badge_names = [b['name'] for b in badges]
    assert "I Can Break It Down" in badge_names, "OLD format should award Badge 1"
    assert "Planner Power" in badge_names, "OLD format should award Badge 2"
    assert "Team Player" in badge_names, "OLD format should award Badge 3"
    print("✅ PASS: OLD format (reflection_text) still works")


if __name__ == "__main__":
    print("=" * 70)
    print("BADGE LOGIC INTEGRATION TESTS")
    print("=" * 70)

    try:
        test_badge_1_break_it_down()
        test_badge_2_planner_power()
        test_badge_3_team_player()
        test_multiple_badges()
        test_no_badges()
        test_backward_compatibility()

        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED!")
        print("=" * 70)
        print("\nBadge Logic Summary:")
        print("✅ Badge 1 'I Can Break It Down': Awards for decomposition keywords OR tasks_edited")
        print("✅ Badge 2 'Planner Power': Awards for timeline_accuracy between 0.8 and 1.2")
        print("✅ Badge 3 'Team Player': Awards for collaboration keywords")
        print("✅ Multiple badges can be earned simultaneously")
        print("✅ Zero badges awarded when no conditions met")
        print("✅ Backward compatibility with OLD format maintained")
        print("=" * 70)

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
