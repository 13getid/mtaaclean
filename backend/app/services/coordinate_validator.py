"""
Service to validate whether given latitude and longitude coordinates
fall within the designated boundary (Tudor, Mombasa).
Uses the Ray-Casting algorithm for point-in-polygon verification.
"""

import json
from pathlib import Path
from typing import Tuple, List

BOUNDARY_FILE = Path(__file__).parent.parent / "data" / "mombasa_boundary.geojson"


def _point_in_polygon(x: float, y: float, polygon: List[List[float]]) -> bool:
    """
    Ray-casting algorithm to determine if a point (x=lng, y=lat) is inside a polygon.
    polygon is a list of [lng, lat] pairs.
    """
    n = len(polygon)
    inside = False

    p1x, p1y = polygon[0]
    for i in range(1, n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside


def is_within_mombasa_boundary(latitude: float, longitude: float) -> Tuple[bool, str]:
    """
    Validates if coordinates are within the supported boundary.
    Returns (is_valid, message).
    """
    # 1. Basic sanity check on range
    if not (-90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0):
        return False, "Invalid geographic coordinate values."

    # 2. Check GeoJSON file exists
    if not BOUNDARY_FILE.exists():
        # Fallback to Tudor approximate bounding box if GeoJSON file is missing
        if -4.060 <= latitude <= -4.015 and 39.645 <= longitude <= 39.690:
            return True, "Valid (Bounding box fallback)"
        return False, "Coordinates fall outside Tudor Sub-county, Mombasa."

    try:
        with open(BOUNDARY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        features = data.get("features", [])
        if not features:
            return False, "Boundary data unavailable."

        geometry = features[0].get("geometry", {})
        coords = geometry.get("coordinates", [])

        if geometry.get("type") == "Polygon" and coords:
            polygon = coords[0]  # exterior ring
            # GeoJSON coordinates are [longitude, latitude]
            if _point_in_polygon(longitude, latitude, polygon):
                return True, "Valid within Tudor, Mombasa"
            else:
                return False, "Report coordinates must fall within the Tudor, Mombasa operational boundary."

        return False, "Unsupported boundary geometry."
    except Exception as e:
        return False, f"Boundary validation error: {str(e)}"
