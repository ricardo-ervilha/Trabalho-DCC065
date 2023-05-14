import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize, getMaxSize
} from "../libs/util/util.js";
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import { airPlaneHeight, heightPlan, numPlans, scale} from './variables.js';
import { Environment } from "./environment.js";
import { Camera } from "./camera.js";
import { Queue } from './queue.js'
import { MathUtils } from '../build/three.module.js';

/*
Description: Responsável por controlar o jogo em si. 
É a classe principal que iniciará o jogo e coordenará as outras classes.
*/

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();

var queue = new Queue();
// O oitavo plano será o que estará na parte de reposição.
for(var i = 0; i < numPlans; i++){
    let environment = new Environment(heightPlan, 100);

    let plane = environment.getPlan();
    //O primeiro plano será renderizado SEMPRE na posição (3h)/2  em z.
    plane.position.z = ((3*heightPlan)/2) - heightPlan * i;
    plane.material.opacity = 1;

    let grid = environment.getGrid();
    grid.material.opacity = 1;

    scene.add(plane);

    queue.enqueue(environment);
}

//Cria o avião
var airplane = null;

// Load animated files
loadGLTFFile('airplane.glb');

function loadGLTFFile(modelName)
{
  var loader = new GLTFLoader( );
  loader.load( modelName, function ( gltf ) {
    var obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child ) {
          child.castShadow = true;
      }
    });
    obj.traverse( function( node )
    {
      if( node.material ) node.material.side = THREE.DoubleSide;
    });

      obj = normalizeAndRescale(obj, scale);
      obj = fixPosition(obj);
      obj.position.y = airPlaneHeight;
      obj.rotateY(MathUtils.degToRad(-90));
      airplane = obj;

    
    scene.add ( obj );

    }, onProgress, onError);
}

function onError() { };

function onProgress () {
    
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

/*
    Parte do fade
*/

function updatePositionPlanes(){
    var count = 0;
    for(var i = 0; i < numPlans; i++){
        let env = queue.peek(i);
        env.move();
        let plane = env.getPlan();
        let grid = env.getGrid();

        //Se plano está no 5h/2 mover ele lá para frente

        if(plane.position.z == (5*heightPlan)/2){
            plane.position.z = (3*heightPlan)/2 - (numPlans-1) * heightPlan;
        }

        //Dados x(limite inferior), y(limite superior); com x < y e um n(posição do plano)
        //O fade é dado por m(opacidade) == 1 + [(y-n)/(x-y)]

        //Se plano está muito na frente, fazer ele ficar invisível
        var y = ((3*heightPlan)/2) - heightPlan * 4.5// -350
        var x = y + heightPlan;
        var n = plane.position.z;
        console.log('y: ' + y);
        console.log('x: ' + x)

        if(n < y){
            plane.material.opacity = 0;
            grid.material.opacity = 0;
        }
        if(n <= x && n >= y )
        {   
            plane.material.opacity = (n-y)/(heightPlan);
            grid.material.opacity = (n-y)/(heightPlan);

        } else if (n > x){
            plane.material.opacity = 1;
            grid.material.opacity = 1;
        }
    }
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


cameraHolder.add(camera);
cameraHolder.add(airplane);
scene.add(cameraHolder);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);


// Mouse variables
document.addEventListener("mousemove", onDocumentMouseMove);


var lastMouseMoveTime = 0;
let targetXOld;
function mouseRotation() {
  targetXOld = targetX;
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  if (airplane) {
    
    if(lerpConfig.destination.distanceTo(airplane.position)>3.5){
      if((targetXOld-targetX)>0){
        //airplane().rotation.y += 0.15 * (targetX - airplane().rotation.y);
        airplane.rotation.y = -0.5;
      }else if((targetXOld-targetX)<0){
        airplane.rotation.y = 0.5;
        //airplane().rotation.y += -0.15 * (targetX - airplane().rotation.y);
      }
    }
    
    airplane.position.lerp(lerpConfig.destination, lerpConfig.alpha);
    //airplane().rotation.x += (0.05 * (targetY - airplane().rotation.x));
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
  var angle = airplane.rotation.y;
  var axis = new THREE.Vector3(0, 1, 0);

  if (angle !== 0) {
      airplane.rotateOnAxis(axis, -angle);
  }
}

render();
function render() {
  var currentTime = Date.now();

  if (currentTime - lastMouseMoveTime > 425) {
    //airplane().rotation.y += airplane().rotation.y;
    rotateObjectToZero();
  }
  

  mouseRotation();
  updatePositionPlanes();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}