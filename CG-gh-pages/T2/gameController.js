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

const numPlanos = 10;
const numAmbientes = 30;
/*
Description: Responsável por controlar o jogo em si. 
É a classe principal que iniciará o jogo e coordenará as outras classes.
*/

let scene, renderer, camera, material, light, orbit; // Initial variables

buildAirPlane();

//Instancio o loader
function buildAirPlane(){
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
        var obj = normalizeAndRescale(obj, 5.0);
        scene.add(obj);
    });
}

// function buildTurret()
// {
//   var mtlLoader = new MTLLoader( );
  
//   mtlLoader.load( './turret.mtl', function ( materials ) {
//       materials.preload();

//       var objLoader = new OBJLoader( );
//       objLoader.setMaterials(materials);

//       objLoader.load( "./turret.obj", function ( obj ) {
         
//          obj.visible = true;
//          obj.traverse( function (child)
//          {
//             child.castShadow = true;
//          });

//          obj.traverse( function( node )
//          {
//             if( node.material ) node.material.side = THREE.DoubleSide;
//          });

//          var obj = normalizeAndRescale(obj, 7.0);
         

//          scene.add ( obj );
         
//       });
//   });
// }

function normalizeAndRescale(obj, newScale) {
    var scale = getMaxSize(obj);
    obj.scale.set(newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale));
    return obj;
}


let cameraHolder = new THREE.Object3D();
const lerpConfig = {
  destination: new THREE.Vector3(0.0, 0.0, 0.0),
  alpha: 0.1
}
const mouse = new THREE.Vector2();
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
for(var i = 0; i < numAmbientes; i++){
  ambiente = new Environment(100, window.innerWidth);
  ambiente.buildPlan();
  queue.enqueue(ambiente);
}

let currentPlanesRendered = [];
for(var i = 0; i <= numPlanos - 1; i++){  
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

function controlsOpacity(){
  for(var i = 0; i < numAmbientes; i++){
    
    let env = queue.dequeue(); 
    
    if(env.getEnvironment().position.z >= 350){
      env.getEnvironment().material.opacity = 0;
      env.getGrid().material.opacity = 0;
    }else if(env.getEnvironment().position.z >= 325 && env.getEnvironment().position.z < 350){
      env.getEnvironment().material.opacity = (1 + (325 - (env.getEnvironment().position.z)) / 25.0);
      env.getGrid().material.opacity = (1 + (300 - (env.getGrid().position.z)) / 50.0);
    }else{
      env.getEnvironment().material.opacity = 1;
      env.getGrid().material.opacity = 1;
    }

    for(var j = 0; j < env.trees.length; j++)
    {    
        //console.log(env.trees[j].getFoundation().position.x + " " + (env.trees[j].getFoundation().position.y + env.getEnvironment().position.z) + " " + env.trees[j].getFoundation().position.z);
        if(env.trees[j].getFoundation().position.y + env.getEnvironment().position.z >= 350){
            env.trees[j].setOpacity(0);
        }else if(env.trees[j].getFoundation().position.y + env.getEnvironment().position.z >= 310 && env.trees[j].getFoundation().position.y + env.getEnvironment().position.z < 350){
          env.trees[j].setOpacity(1 + (310 - (env.trees[j].getFoundation().position.y + env.getEnvironment().position.z)) / 40.0);
        }else{
          env.trees[j].setOpacity(1);
        }
    }
    queue.enqueue(env);
  }
}

// Mouse variables
document.addEventListener("mousemove", onDocumentMouseMove);

function movementPlane(){
  console.log(currentPlanesRendered[0].getEnvironment().position.z)
  console.log(aviao.getBody().position.z)
  if(currentPlanesRendered[0].getEnvironment().position.z + 200 >= aviao.getBody().position.z){
    for(var i = 0; i <= numPlanos-1; i++){
      currentPlanesRendered[i].move();
    }
  }else{
    scene.remove(currentPlanesRendered[0].getEnvironment());
    let plan = addPlaneScene(-100 + (numPlanos - 1)*100);
    for(var i = 1; i < numPlanos; i++){
      currentPlanesRendered[i-1] = currentPlanesRendered[i];
    }
    currentPlanesRendered[currentPlanesRendered.length - 1] = plan;
  }
}

var lastMouseMoveTime = 0;
let targetXOld;
function mouseRotation() {
  targetXOld = targetX;
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  if (aviao.getBody()) {
    
    if(lerpConfig.destination.distanceTo(aviao.getBody().position)>3.5){
      if((targetXOld-targetX)>0){
        //aviao.getBody().rotation.y += 0.15 * (targetX - aviao.getBody().rotation.y);
        aviao.getBody().rotation.y = -0.5;
      }else if((targetXOld-targetX)<0){
        aviao.getBody().rotation.y = 0.5;
        //aviao.getBody().rotation.y += -0.15 * (targetX - aviao.getBody().rotation.y);
      }
    }
    
    aviao.getBody().position.lerp(lerpConfig.destination, lerpConfig.alpha);
    //aviao.getBody().rotation.x += (0.05 * (targetY - aviao.getBody().rotation.x));
  }
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

  //normaliza os valores da posição do mouse de modo que fique com valores entre -1 a +1 (NDC - Normalized Device Coordinate)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //cria um Vector3 com as posições normalizadas (NDC)
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);

  /*
    converte o vector que está no formato NDC para word space (espaço do mundo)
  */
  vector.unproject(camera);

  //vetor direção entre a posição do mouse a posição da camera
   vector.sub(camera.position).normalize();

  //distancia a ser entre  posição da camera e a posição do clique
  var distance = - camera.position.z / vector.z;

  //pos posição efetiva do clique
  var pos = camera.position.clone().add(vector.multiplyScalar(distance));

  lerpConfig.destination.x = pos.x;
  if(pos.y>5){
    lerpConfig.destination.y = pos.y;
  }

  lastMouseMoveTime = Date.now();
}

function rotateObjectToZero() {
  var angle = aviao.getBody().rotation.y;
  var axis = new THREE.Vector3(0, 1, 0);

  if (angle !== 0) {
      aviao.getBody().rotateOnAxis(axis, -angle);
  }
}

render();
function render() {
  var currentTime = Date.now();

  if (currentTime - lastMouseMoveTime > 425) {
    //aviao.getBody().rotation.y += aviao.getBody().rotation.y;
    rotateObjectToZero();
  }

  aviao.turnPin(THREE.MathUtils.degToRad(5));
  mouseRotation();
  movementPlane();
  controlsOpacity();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}