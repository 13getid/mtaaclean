import unittest
from app.services.coordinate_validator import is_within_mombasa_boundary


class TestCoordinateValidator(unittest.TestCase):
    def test_valid_tudor_coordinates(self):
        # Tudor Creek Waterfront
        valid, msg = is_within_mombasa_boundary(-4.0253, 39.6632)
        self.assertTrue(valid)

        # Technical University of Mombasa (TUM)
        valid, msg = is_within_mombasa_boundary(-4.0375, 39.6648)
        self.assertTrue(valid)

        # Tudor Four
        valid, msg = is_within_mombasa_boundary(-4.0320, 39.6680)
        self.assertTrue(valid)

    def test_invalid_out_of_boundary_coordinates(self):
        # Nairobi coordinates
        valid, msg = is_within_mombasa_boundary(-1.2921, 36.8219)
        self.assertFalse(valid)
        self.assertTrue("boundary" in msg.lower() or "outside" in msg.lower())

        # Diani Beach
        valid, msg = is_within_mombasa_boundary(-4.2797, 39.5937)
        self.assertFalse(valid)

        # Nyali
        valid, msg = is_within_mombasa_boundary(-4.0300, 39.7100)
        self.assertFalse(valid)

    def test_malformed_coordinate_ranges(self):
        valid, msg = is_within_mombasa_boundary(-95.0, 39.66)
        self.assertFalse(valid)

        valid, msg = is_within_mombasa_boundary(-4.02, 190.0)
        self.assertFalse(valid)


if __name__ == "__main__":
    unittest.main()
