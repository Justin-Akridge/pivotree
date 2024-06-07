import laspy
import numpy as np
import json
from sklearn.cluster import DBSCAN
def extract_pole_locations(las_file_path, pole_classification=8):
    las = laspy.read(las_file_path)

    points = las.points
    classifications = points.classification

    pole_mask = classifications == pole_classification
    pole_points = points[pole_mask]

    coords = np.vstack((pole_points.x, pole_points.y, pole_points.z, pole_points['HeightAboveGround'])).transpose()
    return coords

def filter_poles_by_point_count(grouped_poles, min_points=40):
    filtered_poles = [group for group in grouped_poles if len(group) >= min_points]
    return filtered_poles

def save_poles_to_json(pole_groups, output_file_path):
    poles_list = []
    for pole_group in pole_groups:
        center_x = pole_group[0]
        center_y = pole_group[1]
        center_z = pole_group[2]
        height = pole_group[3]

        ground_z = center_z - height / 3.281

        poles_list.append({"x": float(center_x), "y": float(center_y), "z": float(ground_z)})

    print(poles_list)
    with open(output_file_path, 'w') as json_file:
        json.dump(poles_list, json_file, indent=4)

def group_poles(coords, tolerance=5):
    dbscan = DBSCAN(eps=tolerance, min_samples=5)
    labels = dbscan.fit_predict(coords[:, :2])

    unique_labels = set(labels)

    grouped_poles = []
    for label in unique_labels:
        pole_group_coords = coords[labels == label]
        if len(pole_group_coords) > 0:
            centroid_x = np.mean(pole_group_coords[:, 0])
            centroid_y = np.mean(pole_group_coords[:, 1])
            centroid_z = np.mean(pole_group_coords[:, 2])
            height_above_ground = np.mean(pole_group_coords[:, 3])
            grouped_poles.append([centroid_x, centroid_y, centroid_z, height_above_ground])

    return grouped_poles



if __name__ == "__main__":
    las_file_path = 'input.las'
    output_file_path = 'pole_locations.json'
    pole_locations = extract_pole_locations(las_file_path)
    grouped_poles = group_poles(pole_locations)

    save_poles_to_json(grouped_poles, output_file_path)
    
    print(f'Pole locations saved to {output_file_path}')

