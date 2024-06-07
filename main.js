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
function addMarkers(poleLocations) {
    poleLocations.forEach(location => {
        positions.push(location.x, location.y, location.z);
        const geometry = new THREE.SphereGeometry(.7, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const circle = new THREE.Mesh(geometry, material);

        circle.position.set(location.x, location.y, location.z);

        potreeViewer.scene.scene.add(circle);
    });
}

console.log(positions)

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
