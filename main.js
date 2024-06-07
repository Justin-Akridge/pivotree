import * as THREE from 'three'; 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const scene = new THREE.Scene();

window.cesiumViewer = new Cesium.Viewer('cesiumContainer', {
	useDefaultRenderLoop: false,
	animation: false,
	baseLayerPicker : false,
	fullscreenButton: false, 
	geocoder: false,
	homeButton: false,
	infoBox: false,
	sceneModePicker: false,
	selectionIndicator: false,
	timeline: false,
	navigationHelpButton: false,
	imageryProvider : Cesium.createOpenStreetMapImageryProvider({url : 'https://a.tile.openstreetmap.org/'}),
	terrainShadows: Cesium.ShadowMode.DISABLED,
});

let cp = new Cesium.Cartesian3(4303414.154026048, 552161.235598733, 4660771.704035539);
cesiumViewer.camera.setView({
	destination : cp,
	orientation: {
		heading : 10, 
		pitch : -Cesium.Math.PI_OVER_TWO * 0.5, 
		roll : 0.0 
	}
});

window.potreeViewer = new Potree.Viewer(document.getElementById("potree_render_area"), {
	useDefaultRenderLoop: false
});
potreeViewer.setEDLEnabled(true);
potreeViewer.setFOV(60);
potreeViewer.setPointBudget(1_000_000);
potreeViewer.setMinNodeSize(0);
potreeViewer.loadSettingsFromURL();
potreeViewer.setBackground(null);

potreeViewer.loadGUI(() => {
	potreeViewer.setLanguage('en');
	$("#menu_appearance").next().show();
	$("#menu_tools").next().show();
	$("#menu_scene").next().show();
	potreeViewer.toggleSidebar();
});

async function loadJsonData() {
	try {
		const response = await fetch('/pole_locations.json');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		console.log('Pole locations:', data);
		addMarkers(data);
	} catch (error) {
		console.error('Error fetching JSON data:', error);
	}
}

loadJsonData();

let intersects = []
let width = window.innerWidth;
let height = window.innerHeight;
let points; 
const positions = [];
// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         const position = new THREE.Vector3(location.x, location.y, location.z);
//         const color = new THREE.Color(0xff0000);
//         const size = 0.7;

//         // Create marker
//         const marker = new Potree.Marker(potreeViewer.scene.scene, position, color, size);
//         marker.description = `Marker at (${location.x}, ${location.y}, ${location.z})`;

//         // Add marker to Potree scene
//         potreeViewer.scene.addMarker(marker);
//     });
// }
// const measure = new Potree.Measure();
// potreeViewer.scene.scene.add(measure); // Add the measure object to the scene

// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         const position = new THREE.Vector3(location.x, location.y, location.z);
//         measure.addMarker(position);

//         // Optionally log positions for debugging
//         console.log('Added marker at:', position);
//     });

//     // Ensure the measure object is visible
//     measure.visible = true;
//     measure.updateMatrixWorld(true);
// }
// const measure = new Potree.Measure();

// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         measure.addMarker(new THREE.Vector3(location.x, location.y, location.z));
//     });
//     potreeViewer.scene.scene.add(measure);
// }
// potreeViewer.inputHandler.registerInteractiveScene(potreeViewer.scene);

// potreeViewer.addEventListener('click', event => {
//     const selectedAnnotation = event.intersection ? event.intersection.object : null;
//     if (selectedAnnotation && selectedAnnotation instanceof Measure) {
//         console.log("Annotation clicked:", selectedAnnotation);
//     }
// });
// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         const position = new THREE.Vector3(location.x, location.y, location.z);

//         // Create a custom circle geometry
//         const geometry = new THREE.CircleGeometry(0.5, 32);
//         const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//         const circle = new THREE.Mesh(geometry, material);
//         circle.position.copy(position);
//         circle.rotation.x = -Math.PI / 2; // Rotate to face upwards

//         // Create a Potree annotation with the custom circle
//         const annotation = new Potree.Annotation({
//             position: position,
//             title: 'Pole',
//             description: 'Pole marker',
//             cameraPosition: position.clone().add(new THREE.Vector3(0, 0, 10)),
//             scale: 1,
//             elements: [circle] // Add the circle as a custom element
//         });

//         // Add the annotation to the Potree scene
//         potreeViewer.scene.annotations.add(annotation);
//     });
// }

// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         const position = new THREE.Vector3(location.x, location.y, location.z);

//         // Create a Potree annotation
//         const annotation = new Potree.Annotation({
//             position: position,
//             cameraPosition: position.clone().add(new THREE.Vector3(0, 0, 10)),
//             scale: 1,
//             color: 0xff0000
//         });

//         // Add the annotation to the Potree scene
//         potreeViewer.scene.annotations.add(annotation);
//     });
// }
// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         const position = new THREE.Vector3(location.x, location.y, location.z);

//         // Create a Potree marker
//         const marker = new Potree.Marker();
//         marker.position.set(location.x, location.y, location.z);
//         marker.setLabel('Pole');
//         marker.setColor(0xff0000); // Set the marker color to red
//         marker.setScale(1); // Set the marker scale

//         // Add the marker to the Potree scene
//         potreeViewer.scene.addMarker(marker);
//     });
// }

// function addMarkers(poleLocations) {
//     const markers = []; // Array to store Marker instances

//     poleLocations.forEach(location => {
//         // Create a new instance of the Marker class
// 		console.log(location)
//         const marker = new Potree.Marker();
// 		console.log(marker)
        
//         // Set position and color properties for the marker
//         marker.setPosition(location);
//         marker.setColor(new THREE.Color(0xff0000)); // Example color
        
//         // Add the marker to the scene or any other container
//         scene.add(marker);

//         // Optionally, store the marker in an array for later reference
//         markers.push(marker);
//     });
// }
// function addMarkers(poleLocations) {
//     const spheres = [];
//     const points = [];

//     poleLocations.forEach(location => {
//         points.push(location);

//         const geometry = new THREE.SphereGeometry(0.7, 32, 32);
//         const material = new THREE.MeshPhongMaterial({ color: 'red' });
//         const sphere = new THREE.Mesh(geometry, material);


//         sphere.position.set(location.x, location.y, location.z);

// 		potreeViewer.scene.scene.add(sphere);
// 		spheres.push(sphere);
//         // Add event listeners with function binding
//     });
// }

let markers = []
let spheres = []
let draggingEnabled = false; // Flag to indicate whether dragging and dropping is enabled

// Function to toggle draggingEnabled flag
function toggleDragging() {
    draggingEnabled = !draggingEnabled; // Toggle the flag
    const buttonText = draggingEnabled ? 'Disable Drag and Drop' : 'Enable Drag and Drop';
    document.getElementById('toggleButton').innerText = buttonText; // Update button text
}

// Add click event listener to the button
document.getElementById('toggleButton').addEventListener('click', toggleDragging);

// Function to handle drag event
// const drag = (e) => {
//     if (draggingEnabled) { 
// 		let I = Potree.Utils.getMousePointCloudIntersection(
// 			e.drag.end, 
// 			e.viewer.scene.getActiveCamera(), 
// 			e.viewer, 
// 			e.viewer.scene.pointclouds,
// 			{pickClipped: true}
// 		);

// 		if (I) {
// 			let i = spheres.indexOf(e.drag.object);
// 			if (i !== -1) {
// 				let point = points[i];

// 				// loop through current keys and cleanup ones that will be orphaned
// 				for (let key of Object.keys(point)) {
// 					if (!I.point[key]) {
// 						delete point[key];
// 					}
// 				}

// 				for (let key of Object.keys(I.point).filter(e => e !== 'position')) {
// 					point[key] = I.point[key];
// 				}

// 				sphere.position.set(I.location.x, I.location.y, I.location.z);
// 				// this.setPosition(i, I.location); // Here, `this` should refer to the instance of the Measure class
// 			}
// 		}
// 	};
// }

// // Function to handle drop event
// const drop = (e) => {
//     if (draggingEnabled) { // Check if dragging is enabled
//         // Your drop event handling logic here
//     }
// };

// // Function to handle mouseover event
// const mouseover = (e) => {
//     if (draggingEnabled) { // Check if dragging is enabled
//         // Your mouseover event handling logic here
//     }
// };

// // Function to handle mouseleave event
// const mouseleave = (e) => {
//     if (draggingEnabled) { // Check if dragging is enabled
//         // Your mouseleave event handling logic here
//     }
// };

// // Iterate over pole locations and create spheres
// function addMarkers(poleLocations) {
// 	poleLocations.forEach(location => {
// 		const geometry = new THREE.CylinderGeometry(0.2, 0.2, 22, 6);
// 		const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
// 		// const material = new THREE.MeshPhongMaterial();
// 		const sphere = new THREE.Mesh(geometry, material);
// 		sphere.rotation.x = Math.PI / 2;
// 		sphere.position.set(location.x, location.y, location.z);

// 		// Add event listeners
// 		sphere.addEventListener('drag', drag);
// 		sphere.addEventListener('drop', drop);
// 		sphere.addEventListener('mouseover', mouseover);
// 		sphere.addEventListener('mouseleave', mouseleave);

// 		potreeViewer.scene.scene.add(sphere);
// 		spheres.push(sphere);
// 	});
// }
function addMarkers(poleLocations) {
	let points = []
    poleLocations.forEach(location => {
        points.push(location);

		const geometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 22);
        // const geometry = new THREE.CylinderGeometry(0.6, 0.6, 2, 32);
		// const material = new THREE.MeshBasicMaterial( {color: 0xfff000} ); 
		const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
		sphere.rotation.x = Math.PI / 2;

        sphere.position.set(location.x, location.y, location.z);

        // Add event listeners with arrow functions
			const drag = (e) => {
				if (draggingEnabled) {
					let I = Potree.Utils.getMousePointCloudIntersection(
						e.drag.end, 
						e.viewer.scene.getActiveCamera(), 
						e.viewer, 
						e.viewer.scene.pointclouds,
						{pickClipped: true}
					);
					console.log('i', I)

					if (I) {
						let i = spheres.indexOf(e.drag.object);
						if (i !== -1) {
							let point = points[i];

							// loop through current keys and cleanup ones that will be orphaned
							for (let key of Object.keys(point)) {
								if (!I.point[key]) {
									delete point[key];
								}
							}

							for (let key of Object.keys(I.point).filter(e => e !== 'position')) {
								point[key] = I.point[key];
							}

							sphere.position.set(I.location.x, I.location.y, I.location.z);
							// this.setPosition(i, I.location); // Here, `this` should refer to the instance of the Measure class
						}
					}
				}
			};

			const drop = (e) => {
				if (draggingEnabled) {
					let I = Potree.Utils.getMousePointCloudIntersection(
						e.drag.end, 
						e.viewer.scene.getActiveCamera(), 
						e.viewer, 
						e.viewer.scene.pointclouds,
						{pickClipped: true}
					);
					// let I = spheres.indexOf(e.drag.object);
					if (I) {
						let i = spheres.indexOf(e.drag.object);
						if (i !== -1) {
							let point = points[i];

							// loop through current keys and cleanup ones that will be orphaned
							for (let key of Object.keys(point)) {
								if (!I.point[key]) {
									delete point[key];
								}
							}

							for (let key of Object.keys(I.point).filter(e => e !== 'position')) {
								point[key] = I.point[key];
							}

							sphere.position.set(I.location.x, I.location.y, I.location.z);
							// this.setPosition(i, I.location); // Here, `this` should refer to the instance of the Measure class
						}
					}
				}
				// if (i !== -1) {
				//     this.dispatchEvent({
				//         'type': 'marker_dropped',
				//         'measurement': this,
				//         'index': i
				//     });
				// }
			};

        const mouseover = (e) => e.object.material.emissive.setHex(0xff0000);
        const mouseleave = (e) => e.object.material.emissive.setHex(0x000000);

        sphere.addEventListener('drag', drag);
        sphere.addEventListener('drop', drop);
        sphere.addEventListener('mouseover', mouseover);
        sphere.addEventListener('mouseleave', mouseleave);

        potreeViewer.scene.scene.add(sphere);
        spheres.push(sphere);
    });
}

// function addMarkers(poleLocations) {
//     poleLocations.forEach(location => {
//         positions.push(location.x, location.y, location.z);
//         const geometry = new THREE.SphereGeometry(.7, 32);
//         const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//         const circle = new THREE.Mesh(geometry, material);
// 		// const marker = new Potree.measure();

//         circle.position.set(location.x, location.y, location.z);

//         potreeViewer.scene.scene.add(circle);
//     });
// }

// console.log(positions)

// function addMarkers(poleLocations) {
//     const geometry = new THREE.BufferGeometry();

//     poleLocations.forEach(location => {
//         positions.push(location.x, location.y, location.z);
//     });

//     geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

//     const material = new THREE.PointsMaterial({
//         color: 0xff0000,
//         size: 100,
//         sizeAttenuation: false,
//     });

//     points = new THREE.Points(geometry, material);
//     potreeViewer.scene.scene.add(points);
// }

// window.addEventListener('mousemove', (e) => {
//     // Update the mouse position
//     mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1);

//     // Update raycaster
//     raycaster.setFromCamera(mouse, camera);

//     // Find intersections
//     intersects = raycaster.intersectObject(points); // Intersect only with the points object

//     // If intersects, change color to hotpink; otherwise, revert to orange
//     if (intersects.length > 0) {
//         points.material.color.set('hotpink');
//     } else {
//         points.material.color.set('orange');
//     }

//     // Convert color to linear space
//     points.material.color.convertSRGBToLinear();
// });

window.addEventListener('click', (e) => {
	console.log(e)
    // Check if the points are clicked
    const findPoint = intersects.find((hit) => hit.object === points);

    if (findPoint) {
        console.log("Point found:", findPoint.point);
    }
});



	Potree.loadPointCloud("pointclouds/bin3/metadata.json", "bin3", e => {
		potreeViewer.scene.addPointCloud(e.pointcloud);
		//e.pointcloud.position.z = 0;
		let material = e.pointcloud.material;
		material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
		
		potreeViewer.fitToScreen()

	})
	function loop(timestamp){
		requestAnimationFrame(loop);

		potreeViewer.update(potreeViewer.clock.getDelta(), timestamp);

		potreeViewer.render();

		if(window.toMap !== undefined){

			{
				let camera = potreeViewer.scene.getActiveCamera();

				let pPos = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
				let pRight = new THREE.Vector3(600, 0, 0).applyMatrix4(camera.matrixWorld);
				let pUp = new THREE.Vector3(0, 600, 0).applyMatrix4(camera.matrixWorld);
				let pTarget = potreeViewer.scene.view.getPivot();

				let toCes = (pos) => {
					let xy = [pos.x, pos.y];
					let height = pos.z;
					let deg = toMap.forward(xy);
					let cPos = Cesium.Cartesian3.fromDegrees(...deg, height);

					return cPos;
				};

				let cPos = toCes(pPos);
				let cUpTarget = toCes(pUp);
				let cTarget = toCes(pTarget);

				let cDir = Cesium.Cartesian3.subtract(cTarget, cPos, new Cesium.Cartesian3());
				let cUp = Cesium.Cartesian3.subtract(cUpTarget, cPos, new Cesium.Cartesian3());

				cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
				cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());

				cesiumViewer.camera.setView({
					destination : cPos,
					orientation : {
						direction : cDir,
						up : cUp
					}
				});

				let aspect = potreeViewer.scene.getActiveCamera().aspect;
				if(aspect < 1){
					let fovy = Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
					cesiumViewer.camera.frustum.fov = fovy;
				}else{
					let fovy = Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
					let fovx = Math.atan(Math.tan(0.5 * fovy) * aspect) * 2
					cesiumViewer.camera.frustum.fov = fovx;
				}

			}

			cesiumViewer.render();
		}
	}

	requestAnimationFrame(loop);
