import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

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

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let cube = new THREE.Mesh(cubeGeometry, material);
// position the cube
cube.position.set(10, 2, 1.0);
// add the cube to the scene
scene.add(cube);

let cubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cubeBB.setFromObject(cube);

let cube2 = new THREE.Mesh(cubeGeometry, material);
cube2.position.set(0, 2, 0);

let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube2BB.setFromObject(cube2);

scene.add(cube2);

document.onkeydown = function(e){
  if(e.keyCode === 37){
    cube2.position.x -= 1;
  }else if(e.keyCode === 39){
    cube2.position.x += 1;
  }else if(e.keyCode === 38){
    cube2.position.z -=1;
  }else if(e.keyCode === 40){
    cube2.position.z +=1;
  }
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

function checkColisions(){
  if(cube2BB.intersectsBox(cubeBB)){
    animation1();
  }else{
    cube.material.opacity = 1;
  }
}

function animation1(){
  cube.material.transparent = true;
  cube.material.opacity = 0.5;
  cube.material.color = new THREE.Color(Math.random() * 0xffffff);
}

render();
function render()
{
  cube2BB.copy( cube2.geometry.boundingBox).applyMatrix4(cube2.matrixWorld);

  checkColisions();

  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}