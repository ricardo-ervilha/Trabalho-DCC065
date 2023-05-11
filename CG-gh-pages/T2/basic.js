import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
    getMaxSize} from "../libs/util/util.js";
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import { airPlaneHeight, scale} from './variables.js';
import { Environment } from './environment.js';

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// Cria o avião
buildAirPlane();

// Cria os planos

// O oitavo plano será o que estará na parte de reposição.
for(var i = 0; i < 8; i++){
    let environment = new Environment(100, 100);

    let plane = environment.getPlan();
    plane.position.z = -550 + i * 100;
    plane.material.opacity = 1;

    let grid = environment.getGrid();
    grid.material.opacity = 1;

    scene.add(plane);

}

//Carrega o avião
function buildAirPlane() {
    var loader = new GLTFLoader();
    var obj;
    // Carrego o arquivo glb nele
    loader.load('./airplane.glb', function (gltf) {
        obj = gltf.scene;
        obj.visible = true;
        obj.traverse(function (child) {
            if (child) {
                child.castShadow = true;
            }
        });
        obj.traverse(function (node) {
            if (node.material) node.material.side = THREE.DoubleSide;
        });
        var obj = normalizeAndRescale(obj, scale);
        var obj = fixPosition(obj);
        obj.position.set(0, airPlaneHeight, 0);
        obj.rotateY(THREE.MathUtils.degToRad(-90));
        scene.add(obj);
    });
}

function normalizeAndRescale(obj, newScale) {

    //Normaliza o objeto e multiplica por uma nova escala
    var scale = getMaxSize(obj);
    obj.scale.set(newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale));
    return obj;
}

function fixPosition(obj) {

    // Corrige a posição do objeto acima do plano
    var box = new THREE.Box3().setFromObject(obj);
    if (box.min.y > 0)
        obj.translateY(-box.min.y);
    else
        obj.translateY(-1 * box.min.y);
    return obj;
}


// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}