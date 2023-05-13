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
import { airPlaneHeight, numPlans, scale} from './variables.js';
import { Environment } from './environment.js';
import { MathUtils } from '../build/three.module.js';
import {Queue} from './queue.js';

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

var queue = new Queue();
// O oitavo plano será o que estará na parte de reposição.
for(var i = 0; i < numPlans; i++){
    let environment = new Environment(100, 100);

    let plane = environment.getPlan();
    //O primeiro plano será renderizado SEMPRE na posição 150 em z.
    plane.position.z = 150 - 100 * i;
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

render();


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
      obj.position.y = 10;
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
        if(plane.position.z == 250){
            plane.position.z = 150 - (numPlans-1) * 100;
        }

        if(plane.position.z > 150){
            plane.material.opacity = 0;
        }
        else if(plane.position.z < 150 - (numPlans -2) * 100)
        {
            plane.material.opacity = 0;
        } else{
            plane.material.opacity = 1;
        }
    }
    console.log(count);
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

function render()
{
  //Para usar o airplane, botar um if dentro desse render.
  updatePositionPlanes();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}