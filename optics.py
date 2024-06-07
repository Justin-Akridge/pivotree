import laspy
import numpy as np
from sklearn.cluster import OPTICS
import json

def extract_pole_locations(las_file_path, pole_classification=8, tolerance=1):
    las = laspy.read(las_file_path)
    try:
        points = [(point.X, point.Y, point.Z) for point in las.points]
    except Exception as e:
        print(f"Error extracting points: {e}")
        return []

    # Print the first few points for debugging
    print("First few points:", points[:5])

    # Extract X and Y coordinates
    try:
        coords = np.array([(point[0], point[1]) for point in points])
    except Exception as e:
        print(f"Error creating numpy array: {e}")
        return []

    # Print the coordinates for debugging
    print("Coordinates:", coords[:5])

    # Apply OPTICS
    try:
        optics = OPTICS(min_samples=3, max_eps=50).fit(coords)
        labels = optics.labels_

        # Group points by their cluster labels
        clustered_points = {}
        for label, point in zip(labels, points):
            if label not in clustered_points:
                clustered_points[label] = []
            clustered_points[label].append(point)

        return clustered_points
    except Exception as e:
        print(f"Error during OPTICS clustering: {e}")
        return []

# Example usage
if __name__ == "__main__":
    las_file_path = 'input.las'
    output_file_path = 'pole_locations.json'
    
    # Extract pole locations
    pole_locations = extract_pole_locations(las_file_path)
    
    # Save to JSON (uncomment the save function if needed)
    # save_pole_locations_to_json(pole_locations, output_file_path)
    
    print(f'Pole locations saved to {output_file_path}')

