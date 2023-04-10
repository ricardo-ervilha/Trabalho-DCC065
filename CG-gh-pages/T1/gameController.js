import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
} from "../libs/util/util.js";
import { Airplane } from "./airplane.js";
import { Environment } from "./environment.js";
import { Camera } from "./camera.js";
import { Queue } from './queue.js'


/*
Description: Responsável por controlar o jogo em si. 
É a classe principal que iniciará o jogo e coordenará as outras classes.
*/

let scene, renderer, camera, material, light, orbit; // Initial variables
let aviao = new Airplane();
let cameraHolder = new THREE.Object3D();
const lerpConfig = {
  destination: new THREE.Vector3(0.0, 0.0, 0.0),
  alpha: 1
}

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer

//camera = initCamera(new THREE.Vector3(-40, 100, -200)); // Init camera in this position
camera = new Camera();
camera = camera.buildCamera();

material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
orbit.enablePan =false;
orbit.enableRotate = false;
orbit.enableZoom = false;

aviao.buildAirPlane();
cameraHolder.add(camera);
cameraHolder.add(aviao.getBody());
scene.add(cameraHolder);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);


// create the wireframe plane
let queue = new Queue(); 
let ambiente;
for(var i = 0; i < 4; i++){
  ambiente = new Environment(100, 100);
  ambiente.buildPlan();
  queue.enqueue(ambiente);
}

let currentPlanesRendered = [];
for(var i = 0; i <= 1; i++){  
  if(i == 0)
    currentPlanesRendered.push(addPlaneScene(50));
  else
    currentPlanesRendered.push(addPlaneScene(50 + (i*100)));
}

function addPlaneScene(position){
  let plan = queue.dequeue();
  plan.getEnvironment().position.z = position;
  scene.add(plan.getEnvironment());
  queue.enqueue(plan);
  return plan;
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

// Mouse variables
document.addEventListener("mousemove", onDocumentMouseMove);

function movementPlane(){
  if(currentPlanesRendered[0].getEnvironment().position.z + 50 >= aviao.getBody().position.z){
    for(var i = 0; i <=1; i++){
      currentPlanesRendered[i].move();
    }
  }else{
    scene.remove(currentPlanesRendered[0].getEnvironment());
    let plan = addPlaneScene(150);
    for(var i = 1; i < 2; i++){
      currentPlanesRendered[i-1] = currentPlanesRendered[i];
    }
    currentPlanesRendered[currentPlanesRendered.length - 1] = plan;
  }
}

function mouseRotation() {
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  if (aviao.getBody()) {
    aviao.getBody().rotation.y += 0.05 * (targetX - aviao.getBody().rotation.y);
    //aviao.getBody().rotation.x += (0.05 * (targetY - aviao.getBody().rotation.x));

    // ---------------------- Movimetnação usando lerp ----------------------
    // let mx = lerpConfig.destination.x + (-targetX);
    // let my = lerpConfig.destination.y + (-targetY);

    // mx = Math.max(-ambiente.width/2, Math.min(50, mx));
    // my = Math.max(-15, Math.min(75, my));

    // lerpConfig.destination.x = mx;
    // lerpConfig.destination.y = my;
    
    // cameraHolder.position.lerp(lerpConfig.destination, lerpConfig.alpha);
    //--------------------------------------------------------------------
    
    //console.log(`posição mouse: ${mouseX}, ${mouseY}`)
    //console.log(`posição camera: ${cameraHolder.position.x}, ${cameraHolder.position.y}`)

    //cameraHolder.position.set(-mouseX,-mouseY,0);
    
     // ---------------------- Movimetnação usando translate ----------------------
    let mx = -mouseX*0.01;
    let my = -mouseY*0.01;

    if((cameraHolder.position.x+mx)>=-ambiente.width/2 && (cameraHolder.position.x+mx)<=ambiente.width/2){
      cameraHolder.translateX(mx);
    }

    if((cameraHolder.position.y+my)>=0 && (cameraHolder.position.y+my)<=100){
      cameraHolder.translateY(my);
    }
    //cameraHolder.translateZ(0.5)
  }
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}


render();
function render() {
  
  aviao.turnPin(THREE.MathUtils.degToRad(5));
  mouseRotation();
  movementPlane();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}