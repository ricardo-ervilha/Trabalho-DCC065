import * as THREE from  'three';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createLightSphere,
       } from "../libs/util/util.js";

import {  airPlaneHeight, heightPlan, numPlans, widthPlan, bulletVelocity, invisiblePlanePosition} from './variables.js';
import { Environment } from './environment.js';
import {Queue} from './queue.js';
import { Airplane } from "./airplane.js";
import KeyboardState from '../libs/util/KeyboardState.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
let scene, renderer, camera, material, orbit; // Initial variables
let pointer = new THREE.Vector2();// posição do mouse na tela
let keyboard = new KeyboardState();
let boolSimulation = true;//simulação está rodando
let clock = new THREE.Clock();
let delta = 0;//segundos entre cada iteraçao do render
let bullets = [];
const lerpConfig = { destination: new THREE.Vector3(0.0, 0.0, 0.0), alpha: 0.05 }//posição destino para a qual o avião vai se deslocar

scene = new THREE.Scene();    // Create main scene

/* Parte do Renderer */
let color = "rgb(0, 0, 0)";

renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true; //Habilita sombras
renderer.shadowMap.type = THREE.PCFShadowMap; //Tipo de sombra

renderer.setClearColor(new THREE.Color(color));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("webgl-output").appendChild(renderer.domElement);
renderer.setClearColor("rgb(30, 30, 42)");

camera = initCamera(new THREE.Vector3(0, 30, 100)); // Init camera in this position
// // Enable mouse rotation, pan, zoom etc.
var cameraControl = new OrbitControls( camera, renderer.domElement );

material = setDefaultMaterial(); // create a basic material

/*---------------------------------------------------------------------------------------------*/

/* Luz Direcional */

var light = new THREE.DirectionalLight(0xffffff, 1);

light.position.set(50, 70, 30); //Luz no X e Y positivos, sombra está a esquerda do avião.
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.castShadow = true; // Permite que a luz projete sombras
light.shadow.camera.left = -widthPlan/2;
light.shadow.camera.right = widthPlan/2 * 19;
light.shadow.camera.near = 1;
light.shadow.camera.far = light.position.y + 100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
light.shadow.radius = 2;

light.target.position.set(-50,0,25);
light.target.updateMatrixWorld();

const helper = new THREE.DirectionalLightHelper( light, 3, 0xffff00 );
const shadowHelper = new THREE.CameraHelper(light.shadow.camera);

scene.add(light);
scene.add(helper);
scene.add(shadowHelper);

const geometry3 = new THREE.SphereGeometry( 0.3, 32, 16 ); 
const material3 = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const sphere = new THREE.Mesh( geometry3, material3 ); scene.add( sphere );
sphere.position.set(light.position.x,light.position.y,light.position.z);

/*---------------------------------------------------------------------------------------------*/

//---------------------------------------------------------
//Cria o avião e o adiciona na cena
let aviao = new Airplane();
aviao.buildAirPlane(scene);

/********************************************************************************************** */

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
window.addEventListener('mousemove', onMouseMove);//quando o mouse mover, atualiza a posição destino
window.addEventListener("click", onMouseClick);
document.body.style.cursor = "none";


// -- Cria o raycaster que será usado para fazer interseção entre o plano e a posição do mouse
let raycaster = new THREE.Raycaster();

// Cria o plano que será usado para fazer interseção com o mouse
let invisiblePlane, planeGeometry, planeMaterial;

planeGeometry = new THREE.PlaneGeometry(widthPlan, 60, 1, 1);
planeMaterial = new THREE.MeshLambertMaterial();
// planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 0.5;
invisiblePlane = new THREE.Mesh(planeGeometry, planeMaterial);
invisiblePlane.position.set(invisiblePlanePosition.x, invisiblePlanePosition.y, invisiblePlanePosition.z)
scene.add(invisiblePlane);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
axesHelper.translateY(10)
scene.add(axesHelper);

var queue = new Queue();
var torretas = [];
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

    let conjunto = {
        torreta: null,
        bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
        loaded: false
    }
    
    torretas.push(conjunto);
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
        let intersects = raycaster.intersectObject(invisiblePlane);

        if (intersects.length > 0) // Check if there is a intersection
        {
            let point = intersects[0].point; // Pick the point where interception occurrs
            
            if(point.x>-45 && point.x<45 && invisiblePlane == intersects[0].object ) {
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
        aviao.target.position.set(lerpConfig.destination.x, lerpConfig.destination.y, invisiblePlanePosition.z);
        rotateAirplane();
        
        anguloX =  Math.round(aviao.getAirplane().rotation.x * 180 / Math.PI);
        anguloY =  Math.round(aviao.getAirplane().rotation.y * 180 / Math.PI);
        anguloZ =  Math.round(aviao.getAirplane().rotation.z * 180 / Math.PI);
        // console.log("Ângulo em graus em torno do eixo X: " + anguloX);
        // console.log("Ângulo em graus em torno do eixo Y: " + anguloY);
        // console.log("Ângulo em graus em torno do eixo Z: " + anguloZ);
    }
}

/*
    Função para fazer pequenos movimentos na camera quando o avião chegar próximo às bordas
*/
function moveCamera(){
    if(aviao.getAirplane().position.x < -25){
        if(cameraControl.target.x > -5){
            cameraControl.update();
            cameraControl.target.x -= 0.1;
        }
    }

    if(aviao.getAirplane().position.x > 25){
        if(cameraControl.target.x < 5){
            cameraControl.update();
            cameraControl.target.x += 0.1;
        }
    }

    if(aviao.getAirplane().position.y > 30){
        if(cameraControl.target.y < 15){
            cameraControl.update();
            cameraControl.target.y += 0.1;
        }
    }else {
        if(cameraControl.target.y > 0){
            cameraControl.update();
            cameraControl.target.y -= 0.1;
        }
    }
}

function moveCamera2(){
    if(aviao.getAirplane().position.x < -25 || aviao.getAirplane().position.x > 25){
        cameraControl.target.lerp(aviao.getAirplane().position, 0.01);
        cameraControl.update();
    }
}


function onMouseClick(event) {
    if(event.button == 0){
        let obj = {
            bullet: null,
            dir: null,
            bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
        }
        
        let bullet = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 4), new THREE.MeshBasicMaterial({
          color: "red"
        }));
    
        obj.bullet = bullet;
        obj.bb.setFromObject(obj.bullet);
    
        scene.add(bullet);
    
        //Bullet recebe a posição do avião
        aviao.getAirplane().getWorldPosition(bullet.position);
        //aviao.getAirplane().getWorldQuaternion(bullet.quaternion);
        
        //Pego a diferença entre as coordenadas da câmera e do target
        var x = camera.position.x - aviao.target.position.x;
        var y =  camera.position.y - aviao.target.position.y;
        var z = camera.position.z - aviao.target.position.z;
    
        //Extraio o módulo
        var moduloDirectBullet = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z,2));
    
        //Normalizo
        x = x / moduloDirectBullet;
        y = y / moduloDirectBullet;
        z = z / moduloDirectBullet;
    
        var directionBullet = new THREE.Vector3(x,y,z);
    
        obj.dir = directionBullet;
    
        bullets.push(obj);
    }
}


const raycasterB = new THREE.Raycaster();
const raycasterOrigin = new THREE.Vector3();
const raycasterDirection = new THREE.Vector3();

function updateBullets () {
    [...bullets].forEach(bulletObj => {
        // NOTE Raycast from each bullet and see if it hit any target compatible with the idea of being hit by a bullet
        bulletObj.bullet.getWorldPosition(raycasterOrigin);
        bulletObj.bullet.getWorldDirection(raycasterDirection);

        raycasterB.set(raycasterOrigin, raycasterDirection);

        const hits = raycasterB.intersectObjects([], true);//possivelmente a lista de objetos da cena

        if (hits.length>0) {
            const firstHitTarget = hits[0];

            // NOTE React to being hit by the bullet in some way, for example:
            // firstHitTarget.onHit();

            // NOTE Remove bullet from the world
            bulletObj.bullet.removeFromParent();

            bullets.splice(bullets.indexOf(bulletObj.bullet), 1);
        }

        // NOTE If no target was hit, just travel further, apply gravity to the bullet etc.
        bulletObj.bullet.position.x -= bulletObj.dir.getComponent(0) * bulletVelocity * delta;
        bulletObj.bullet.position.y -= bulletObj.dir.getComponent(1) * bulletVelocity * delta;
        bulletObj.bullet.position.z -= bulletObj.dir.getComponent(2) * bulletVelocity * delta;
        //bullet.translateX(-delta*speed)
    });
};

function keyboardUpdate() {
    keyboard.update();
  
    if ( keyboard.down("esc") ){
        boolSimulation = !boolSimulation;
        if(boolSimulation){            
            document.body.style.cursor = "none";
        }else{
            document.body.style.cursor = null;
        }
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
    bullets.forEach( (bulletObj) => {
        torretas.forEach ( (torretaObj) => {
            if(torretaObj.torreta != null){
                if(bulletObj.bb.intersectsBox(torretaObj.bb)){
                    animation1(torretaObj.torreta);
                }
            }
        })
    })
}

function animation1(obj){
    obj.scale.set(0,0,0);
}

render();
function render()
{ 
    bullets.forEach( (bulletObj) => {
        bulletObj.bb.setFromObject( bulletObj.bullet );
    })

    torretas.forEach( (conjunto) => {
        if(conjunto.torreta != null && !conjunto.loaded){
            conjunto.bb.setFromObject(conjunto.torreta);
            conjunto.loaded = true;

        }else if(conjunto.torreta != null && conjunto.loaded){
            conjunto.bb.setFromObject(conjunto.torreta);
        }
    })

    for(var i = 0; i < numPlans-1; i++){
        var teste = queue.peek(i).getTurrets();
        if(teste != null && torretas[i].torreta == null){
            torretas[i].torreta = teste;
        }
    }

    checkColisions();
    
    delta = clock.getDelta();
    if(aviao.getAirplane()){
        updateBullets();

        moveAirPlane();

    
        moveCamera();
        

    }
    
    
    keyboardUpdate();
    
    updatePositionPlanes();
    
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}