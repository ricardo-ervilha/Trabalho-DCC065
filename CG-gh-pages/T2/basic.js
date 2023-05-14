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
import { Airplane } from "./airplane.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
let pointer = new THREE.Vector2();// posição do mouse na tela
const lerpConfig = { destination: new THREE.Vector3(0.0, 0.0, 0.0), alpha: 0.05 }//posição destino para a qual o avião vai se deslocar

scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 30, 100)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
window.addEventListener('mousemove', onMouseMove);//quando o mouse mover, atualiza a posição destino

//Cria o avião e o adiciona na cena
let aviao = new Airplane();
aviao.buildAirPlane(scene);

// -- Cria o raycaster que será usado para fazer interseção entre o plano e a posição do mouse
let raycaster = new THREE.Raycaster();

// Cria o plano que será usado para fazer interseção com o mouse
let plane, planeGeometry, planeMaterial;

planeGeometry = new THREE.PlaneGeometry(150, 30, 1, 1);
planeMaterial = new THREE.MeshLambertMaterial();
planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 1;
plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.translateY(15);//move para cima para evitar que o avião passe abaixo do plano
scene.add(plane);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add(axesHelper);

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
    //console.log(count);
}

/**
 * Função chamada quando o evento mover o mouse é disparado
 * @param {*} event 
 */

function onMouseMove(event){
    if(aviao.getAirplane()){
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // update the picking ray with the camera and pointer position
        raycaster.setFromCamera(pointer, camera);

        // calculate plane intersecting the picking ray
        let intersects = raycaster.intersectObject(plane);

        if (intersects.length > 0) // Check if there is a intersection
        {
            let point = intersects[0].point; // Pick the point where interception occurrs

            if(plane == intersects[0].object ) {
                lerpConfig.destination.x = point.x;
                lerpConfig.destination.y = point.y;
            }
        }
    }
};

/**
 * Função para fazer a rotação do avião
 */
function rotateAirplane(){
    if(aviao.getAirplane()){
        let rad = THREE.MathUtils.degToRad(45);
        let quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rad);
        //aviao.getAirplane().quaternion.slerp(quat, 0.01);
    }
}

/**
 * Função para mover o avião para  a posição do mouse
 */
function moveAirPlane(){
    if(aviao.getAirplane()){
        aviao.getAirplane().position.lerp(lerpConfig.destination, lerpConfig.alpha);
        rotateAirplane();
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

render();
function render()
{ 
    moveAirPlane();
    updatePositionPlanes();

    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}