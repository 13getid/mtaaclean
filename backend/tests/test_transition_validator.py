import unittest
from app.services.transition_validator import validate_status_transition


class TestTransitionValidator(unittest.TestCase):
    def test_valid_forward_transitions(self):
        valid, _ = validate_status_transition("submitted", "under_review", "staff")
        self.assertTrue(valid)

        valid, _ = validate_status_transition("under_review", "assigned", "staff")
        self.assertTrue(valid)

        valid, _ = validate_status_transition("assigned", "in_progress", "staff")
        self.assertTrue(valid)

        valid, _ = validate_status_transition("in_progress", "resolved", "staff")
        self.assertTrue(valid)

    def test_rejection_rules(self):
        valid, msg = validate_status_transition("submitted", "rejected", "staff", notes=None)
        self.assertFalse(valid)
        self.assertTrue("rejection requires an explanatory note" in msg.lower())

        valid, msg = validate_status_transition("submitted", "rejected", "staff", notes="short")
        self.assertFalse(valid)

        valid, _ = validate_status_transition(
            "submitted", "rejected", "staff", notes="Duplicate of report #42, already handled."
        )
        self.assertTrue(valid)

    def test_invalid_arbitrary_transitions(self):
        valid, msg = validate_status_transition("submitted", "resolved", "staff")
        self.assertFalse(valid)
        self.assertTrue("invalid status transition" in msg.lower())

        valid, msg = validate_status_transition("resolved", "in_progress", "staff")
        self.assertFalse(valid)

    def test_reopen_rejected_report_role_boundary(self):
        valid, msg = validate_status_transition(
            "rejected", "under_review", user_role="staff", notes="Please reconsider"
        )
        self.assertFalse(valid)
        self.assertTrue("only system administrators" in msg.lower())

        valid, _ = validate_status_transition(
            "rejected", "under_review", user_role="admin", notes="Re-evaluating incident"
        )
        self.assertTrue(valid)


if __name__ == "__main__":
    unittest.main()
