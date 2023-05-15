import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createLightSphere,
       } from "../libs/util/util.js";

import {  airPlaneHeight, heightPlan, numPlans, widthPlan} from './variables.js';
import { Environment } from './environment.js';
import {Queue} from './queue.js';
import { Airplane } from "./airplane.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
let pointer = new THREE.Vector2();// posição do mouse na tela
const lerpConfig = { destination: new THREE.Vector3(0.0, 0.0, 0.0), alpha: 0.05 }//posição destino para a qual o avião vai se deslocar

scene = new THREE.Scene();    // Create main scene

/* Parte do Renderer */
let color = "rgb(0, 0, 0)";

renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true; //Habilita sombras
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFShadowMap; //Tipo de sombra

renderer.setClearColor(new THREE.Color(color));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("webgl-output").appendChild(renderer.domElement);
renderer.setClearColor("rgb(30, 30, 42)");

camera = initCamera(new THREE.Vector3(0, 30, 100)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material

/*---------------------------------------------------------------------------------------------*/

/* Luz Direcional */
let lightIntensity = 1.0;
let lightPosition = new THREE.Vector3(30, 80, 20);
let lightColor = "rgb(255, 255, 255)";

light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, -10);
light.castShadow = true; // Permite que a luz projete sombras
light.shadow.camera.left = -20;
  light.shadow.camera.right = 20;
scene.add(light);

const geometry3 = new THREE.SphereGeometry( 0.3, 32, 16 ); 
const material3 = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const sphere = new THREE.Mesh( geometry3, material3 ); scene.add( sphere );
sphere.position.set(light.position.x,light.position.y,light.position.z);

const geometry2 = new THREE.BoxGeometry( 3, 3, 3 ); 
    const material2 = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
    const cube = new THREE.Mesh( geometry2, material2); 
    cube.position.y = 1.5;
    cube.castShadow = true;
    scene.add( cube );
/*---------------------------------------------------------------------------------------------*/

orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
window.addEventListener('mousemove', onMouseMove);//quando o mouse mover, atualiza a posição destino
document.body.style.cursor = "none";

//Cria o avião e o adiciona na cena
let aviao = new Airplane();
aviao.buildAirPlane(scene);

// -- Cria o raycaster que será usado para fazer interseção entre o plano e a posição do mouse
let raycaster = new THREE.Raycaster();

// Cria o plano que será usado para fazer interseção com o mouse
let plane, planeGeometry, planeMaterial;

planeGeometry = new THREE.PlaneGeometry(widthPlan, 30, 1, 1);
planeMaterial = new THREE.MeshLambertMaterial();
planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 0.;
plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.translateY(30);//move para cima para evitar que o avião passe abaixo do plano
scene.add(plane);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
axesHelper.translateY(10)
scene.add(axesHelper);

var queue = new Queue();
// O oitavo plano será o que estará na parte de reposição.
for(var i = 0; i < numPlans; i++){
    let environment = new Environment(heightPlan, 100);

    let plane = environment.getPlane();
    //O primeiro plano será renderizado SEMPRE na posição (3h)/2  em z.
    plane.position.z = ((3*heightPlan)/2) - heightPlan * i;
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

    for(var i = 0; i < numPlans; i++){
        let env = queue.peek(i);
        env.move();
        let plane = env.getPlane();

        //Se plano está no 5h/2 mover ele lá para frente

        if(plane.position.z == (5*heightPlan)/2){
            plane.position.z = (3*heightPlan)/2 - (numPlans-1) * heightPlan;
        }

        //Dados x(limite inferior), y(limite superior); com x < y e um n(posição do plano)
        //O fade é dado por m(opacidade) == 1 + [(y-n)/(x-y)]

        //Se plano está muito na frente, fazer ele ficar invisível
        var y = ((3*heightPlan)/2) - heightPlan * 6
        var x = y + heightPlan;
        var n = plane.position.z;


        if(n < y){
            env.setLeftCubeOpacity(0);
            env.setRightCubeOpacity(0);
            env.setPlaneOpacity(0);
        }
        if(n <= x && n >= y )
        {   
            env.setLeftCubeOpacity((n-y)/(heightPlan));
            env.setRightCubeOpacity((n-y)/(heightPlan));
            env.setPlaneOpacity((n-y)/(heightPlan));

        } else if (n > x){
            env.setLeftCubeOpacity(1);
            env.setRightCubeOpacity(1);
            env.setPlaneOpacity(1);
        }
    }
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

let sensibilidadeMouse = 0.05;
let velocidadeRetorno = 0.05;
var anguloX;
var anguloY;
var anguloZ;

/**
 * Função para fazer a rotação do avião
 */
function rotateAirplane(){
    
    // Distância entre a posição do avião e do mouse
    let dist = Math.round(lerpConfig.destination.distanceTo(aviao.getAirplane().position));

    if(aviao.getAirplane() && dist > 4){
        //Fazer rotação em função da distancia, quant maior a distancia mais rapido rotaciona
        if(lerpConfig.destination.x > aviao.getAirplane().position.x){
            aviao.getAirplane().rotateX(THREE.MathUtils.degToRad(-dist * sensibilidadeMouse));
        }else{
            aviao.getAirplane().rotateX(THREE.MathUtils.degToRad(dist * sensibilidadeMouse));
        }
        if(lerpConfig.destination.y > aviao.getAirplane().position.y){
            aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(-dist*sensibilidadeMouse)*0.4);
        }else{
            aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(dist*sensibilidadeMouse*0.4));
        }
    } else {
        let quat = new THREE.Quaternion().setFromEuler(aviao.getOriginalRotation());
        aviao.getAirplane().quaternion.slerp(quat, velocidadeRetorno);
    }
}

/**
 * Função para mover o avião para  a posição do mouse
 */
function moveAirPlane(){
    if(aviao.getAirplane()){
        aviao.getAirplane().position.lerp(lerpConfig.destination, lerpConfig.alpha);
        aviao.target.position.copy(lerpConfig.destination);
        rotateAirplane();
        
        anguloX =  Math.round(aviao.getAirplane().rotation.x * 180 / Math.PI);
        anguloY =  Math.round(aviao.getAirplane().rotation.y * 180 / Math.PI);
        anguloZ =  Math.round(aviao.getAirplane().rotation.z * 180 / Math.PI);
        // console.log("Ângulo em graus em torno do eixo X: " + anguloX);
        // console.log("Ângulo em graus em torno do eixo Y: " + anguloY);
        // console.log("Ângulo em graus em torno do eixo Z: " + anguloZ);
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