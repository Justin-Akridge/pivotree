import laspy
import numpy as np
import json

def extract_pole_locations(las_file_path, pole_classification=8, tolerance=1):
    las_file = laspy.read(las_file_path)

    points = las_file.points
    classifications = points['classification']
    pole_points_mask = classifications == pole_classification

    pole_points = points[pole_points_mask]

    x = pole_points['X']
    y = pole_points['Y']
    z = pole_points['Z']
    height = pole_points['HeightAboveGround']
    scan_angle_value = pole_points['scan_angle_rank']

    pole_coords = np.column_stack((x, y))
    sorted_indices = np.lexsort((y, x))
    pole_coords_sorted = pole_coords[sorted_indices]

    diffs = np.diff(pole_coords_sorted, axis=0)
    distances = np.linalg.norm(diffs, axis=1)
    split_indices = np.where((distances > tolerance) | (distances == 0))[0] + 1

    poles = np.split(pole_coords_sorted, split_indices)

    pole_data = []
    for pole in poles:
        indices = np.where(np.isin(pole_coords, pole).all(axis=1))[0]
        pole_data.append(points[sorted_indices[indices]])

    print(pole_data)
    return pole_data

#def extract_pole_locations(las_file_path, pole_classification=8, tolerance=1):
#    las_file = laspy.read(las_file_path)
#    
#    last_x = None
#    last_y = None
#    points = las_file.points
#    poles = {}
#    current_pole = 1
#    for point in points:
#        x = point['X']
#        y = point['Y']
#        z = point['Z']
#        height = point['HeightAboveGround']
#        classification = point['classification']
#        scan_angle_value = point['scan_angle_rank']
#        
#        if classification == pole_classification:
#            if last_x is None or abs(x - last_x) > tolerance or abs(y - last_y) > tolerance:
#                 current_pole += 1
#                 poles[current_pole] = []  # Start a new group
#            last_x = x
#            last_y = y
#
#        # Add point to the current pole
#        poles.setdefault(current_pole, []).append((x, y, z, height, classification, scan_angle_value))
#    print(poles)


# Example usage:
#extract_pole_locations("path_to_your_las_file.las")
#def extract_pole_locations(las_file_path, pole_classification=8):
#    las_file = laspy.read(las_file_path)
#    points = las_file.points
#    for point in points:
#        x = point[0]  # Access x coordinate
#        y = point[1]  # Access y coordinate
#        z = point[2]  # Access z coordinate
#        classification = point[3]  # Access classification
#        intensity = point[4]  # Access intensity
#        if classification == pole_classification:
#            print(f"Point at (x={x}, y={y}, z={z}) is classified as a pole.") 

#def save_pole_locations_to_json(pole_locations, output_file_path):
#    # Convert to list of dictionaries for JSON
#    poles_list = [{"x": float(x), "y": float(y), "z": float(z)} for x, y, z in pole_locations]
#    
#    # Save to JSON file
#    with open(output_file_path, 'w') as json_file:
#        json.dump(poles_list, json_file, indent=4)

if __name__ == "__main__":
    las_file_path = 'input.las'
    output_file_path = 'pole_locations.json'
    
    # Extract pole locations
    pole_locations = extract_pole_locations(las_file_path)
    
    #pole_groups = group_poles(pole_locations, threshold=1.0)
    # Save to JSON
    #save_pole_locations_to_json(pole_locations, output_file_path)
    
    print(f'Pole locations saved to {output_file_path}')

