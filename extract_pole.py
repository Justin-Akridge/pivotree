import laspy
import numpy as np
from sklearn.cluster import DBSCAN
import json
from scipy.spatial import KDTree

def extract_pole_locations(las_file_path, pole_classification=8):
    las = laspy.read(las_file_path)

    points = las.points
    classifications = points.classification

    pole_mask = classifications == pole_classification
    pole_points = points[pole_mask]

    coords = np.vstack((pole_points.x, pole_points.y, pole_points.z)).transpose()
   
    return coords

#def save_pole_locations_to_json(pole_locations, output_file_path):
#    poles_list = [{"x": float(x), "y": float(y), "z": float(z)} for x, y, z in pole_locations]
#    
#    with open(output_file_path, 'w') as json_file:
#        json.dump(poles_list, json_file, indent=4)

def filter_poles_by_point_count(grouped_poles, min_points=10):
    # Filter out poles with fewer points than min_points
    filtered_poles = [group for group in grouped_poles if len(group) >= min_points]
    print(len(filtered_poles))
    return filtered_poles

def save_pole_groups_to_json(pole_groups, output_file_path):
    # Convert groups to a list of dictionaries for JSON
    poles_list = []
    for group in pole_groups:
        group_dict = [{"x": float(x), "y": float(y), "z": float(z)} for x, y, z in group]
        poles_list.append(group_dict)

    # Save to JSON file
    with open(output_file_path, 'w') as json_file:
        json.dump(poles_list, json_file, indent=4)

def group_poles_by_location(coords, tolerance=1):
    grouped_poles = []

    # Group poles by X-axis
    x_groups = group_by_axis(coords, axis=0, tolerance=tolerance)

    # Group poles by Y-axis within each X-group
    for x_group in x_groups:
        y_groups = group_by_axis(x_group, axis=1, tolerance=tolerance)
        grouped_poles.extend(y_groups)

    return grouped_poles

def group_by_axis(coords, axis, tolerance):
    grouped = []
    current_group = []

    # Sort the coordinates based on the specified axis
    coords_sorted = sorted(coords, key=lambda x: x[axis])

    # Iterate through the sorted coordinates
    for point in coords_sorted:
        if not current_group:  # If current group is empty, start a new one
            current_group.append(point)
        else:
            # Calculate distance between the current point and the last point in the group
            distance = abs(point[axis] - current_group[-1][axis])
            if distance <= tolerance:
                current_group.append(point)  # Add point to current group
            else:
                grouped.append(current_group)  # Finish current group
                current_group = [point]  # Start a new group

    # Add the last group to the list
    if current_group:
        grouped.append(current_group)

    return grouped
#def group_poles_by_location(coords, tolerance=1):
#    grouped_poles = []
#    current_group = []
#
#    # Iterate through the points and group them
#    for point in coords:
#        if not current_group:  # If current group is empty, start a new one
#            current_group.append(point)
#        else:
#            # Calculate distance between the current point and the last point in the group
#            distance = np.linalg.norm(point[:2] - current_group[-1][:2])
#            if distance <= tolerance:
#                current_group.append(point)  # Add point to current group
#            else:
#                grouped_poles.append(current_group)  # Finish current group
#                current_group = [point]  # Start a new group
#
#    # Add the last group to the list
#    if current_group:
#        grouped_poles.append(current_group)
#
#    return grouped_poles
#def group_poles_by_location(coords, tolerance=1):
#    # Use KDTree for efficient spatial grouping
#    tree = KDTree(coords[:, :2])  # Only consider X and Y for grouping
#
#    grouped_poles = []
#    visited = set()
#
#    for idx, point in enumerate(coords):
#        if idx in visited:
#            continue
#        # Find all points within the tolerance distance
#        indices = tree.query_ball_point(point[:2], r=tolerance)
#        group = coords[indices]
#        grouped_poles.append(group)
#        visited.update(indices)
#
#    return grouped_poles

if __name__ == "__main__":
    las_file_path = 'input.las'
    output_file_path = 'pole_locations.json'
    pole_locations = extract_pole_locations(las_file_path)
    
    grouped = group_poles_by_location(pole_locations)
    # Filter poles by the number of points they contain
    filtered_poles = filter_poles_by_point_count(grouped, min_points=10)
    
    # Save filtered pole locations to JSON file
    save_pole_groups_to_json(filtered_poles, output_file_path) 
    print(f'Pole locations saved to {output_file_path}')

