import * as Cesium from 'cesium';
import * as THREE from 'three';
import 'cesium/Build/Cesium/Widgets/widgets.css';
// import Potree from './build/potree/potree/'; // Adjust path
// const Cesium = window.Cesium;
const Potree = window.Potree;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNDUxMjM2MS00ODYwLTRjYjEtODhmMy0yZGE3NGVlMjUyOTkiLCJpZCI6MjExMzY3LCJpYXQiOjE3MTQwNzI0MzN9.54sPRmtK-snUlZx3mB3PXADPHVwc1X43K0ybFCvIHhA"

Cesium.ArcGisMapService.defaultAccessToken = "AAPK917133dcdeaa453393e099bd92f26607tmKg64wPE1Pw4a-eM50qkj-WBWBYxcXRkej51plWX2qNl2-7AQVAbj01hd8oFOJX";
const viewer = new Cesium.Viewer('cesiumContainer', {
	terrain: Cesium.Terrain.fromWorldTerrain(),
	shadowMap: false,
	baseLayerPicker: false,
	homeButton: false,
	fullscreenButton: false,
	navigationHelpButton: false,
	vrButton: false,
	sceneModePicker: false,
	geocoder: true,
	infobox: false,
	selectionIndicator: false,
	timeline: false,
	projectionPicker: false,
	clockViewModel: null,
	animation: false,
	terrainShadows: Cesium.ShadowMode.DISABLED,
	baseLayer: Cesium.ImageryLayer.fromProviderAsync(
		Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
		  Cesium.ArcGisBaseMapType.SATELLITE
		)
	  ),
	// https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/#enabling-request-render-mode
	requestRenderMode: true,
});

//destroy both the skybox and the sun
window.cesiumViewer = viewer
viewer.scene.skyBox.destroy()
viewer.scene.skyBox = undefined
viewer.scene.sun.destroy();
viewer.scene.sun = undefined;
viewer.scene.moon.destroy();
viewer.scene.moon = undefined;

// const cesiumCamera = new Cesium.Camera(viewer.scene);
// cesiumCamera.position = new Cesium.Cartesian3();
// cesiumCamera.direction = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
// cesiumCamera.up = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_Y);
// cesiumCamera.frustum.fov = Cesium.Math.PI_OVER_THREE;
// cesiumCamera.frustum.near = 1.0;
// cesiumCamera.frustum.far = 2.0;
// cesiumCamera.defaultZoomAmount = 50

window.potreeViewer = new Potree.Viewer(document.getElementById("potree_render_area"), {
	useDefaultRenderLoop: false
});
potreeViewer.setEDLEnabled(true);
potreeViewer.setFOV(60);
potreeViewer.setPointBudget(2_000_000);
potreeViewer.setMinNodeSize(0);
potreeViewer.loadSettingsFromURL();
potreeViewer.setBackground(null);

potreeViewer.loadGUI(() => {
	potreeViewer.setLanguage('en');
	$("#menu_appearance").next().show();
	$("#menu_tools").next().show();
	$("#menu_scene").next().show();
	// potreeViewer.toggleSidebar();
});

let poleLocations;

async function loadJsonData() {
	try {
		const response = await fetch('/pole_locations.json');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		poleLocations = data;
		addMarkers(data);
	} catch (error) {
		console.error('Error fetching JSON data:', error);
	}
}

loadJsonData();

let intersects = []
let points; 
let spheres = []
let draggingEnabled = false; 

// Function to toggle draggingEnabled flag
function toggleDragging() {
    draggingEnabled = !draggingEnabled;
}

document.getElementById('toggleButton').addEventListener('click', toggleDragging);

function addMarkers(poleLocations) {
	let points = []
    poleLocations.forEach(location => {
        points.push(location);

		const geometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 22);
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

window.addEventListener('click', (e) => {
	console.log(e)
    const findPoint = intersects.find((hit) => hit.object === points);

    if (findPoint) {
        console.log("Point found:", findPoint.point);
    }
});

function localToGeographic(x, y, z) {
    // This function should convert local coordinates to WGS84 lat/lon/height.
    const utmZone = '+proj=utm +zone=16 +datum=WGS84 +units=m +no_defs';
    const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
    const [lon, lat] = proj4(utmZone, wgs84, [x, y]);
    return { lat, lon, height: z };
}


Potree.loadPointCloud("pointclouds/bin3/metadata.json", "bin3", e => {
	const pointCloud = e.pointcloud;
	potreeViewer.scene.addPointCloud(pointCloud);

	//e.pointcloud.position.z = 0;
	let material = e.pointcloud.material;
	material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
	
	potreeViewer.fitToScreen()

	const pos = pointCloud.position
	const coords = localToGeographic(pos.x, pos.y, pos.z);

	const cesiumCenter = Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, coords.z);

    const offset = Cesium.Cartesian3.add(
        cesiumCenter,
        new Cesium.Cartesian3(0, 0, 1000),
        new Cesium.Cartesian3()
    );

    viewer.camera.setView({
        destination: offset,
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90.0),
            roll: 0.0
        }
    });

	const pointcloudProjection = '+proj=utm +zone=16 +datum=WGS84 +units=m +no_defs'; // Example projection string
	pointCloud.projection = pointcloudProjection;
	// let mapProjection = proj4.defs("WGS84");

	// window.toMap = proj4(pointcloudProjection, mapProjection);
	// window.toScene = proj4(mapProjection, pointcloudProjection);

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
