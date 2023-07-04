import * as THREE from  'three';
import {initRenderer,
    setDefaultMaterial,
    InfoBox,
    onWindowResize
} from "./util.js";

import {initCamera} from "./camera.js";

import {  heightPlan, numPlans, widthPlan, bulletVelocity, invisiblePlanePosition,cameraPosition} from './variables.js';
import { Environment } from './environment.js';
import {Queue} from './queue.js';
import { Airplane } from "./airplane.js";
import KeyboardState from '../libs/util/KeyboardState.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { velocityPlan, cadenciaTirosTorreta, sizeCube } from './variables.js';

let scene, renderer, camera, material, orbit; // Initial variables
let pointer = new THREE.Vector2();// posição do mouse na tela
let keyboard = new KeyboardState();
let boolSimulation = true;//simulação está rodando
let clock = new THREE.Clock();
let delta = 0;//segundos entre cada iteraçao do render
let cadenciaTime = 0;
let cadenciaTime2 = 0;
let bullets = [];
const lerpConfig = { destination: new THREE.Vector3(0.0, 12.0, 0), alpha: 0.05 }//posição destino para a qual o avião vai se deslocar

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

camera = initCamera(new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z)); //Voltar isso para o normal

// Enable mouse rotation, pan, zoom etc.
var cameraControl = new OrbitControls( camera, renderer.domElement );
cameraControl.enablePan = false;
cameraControl.enableRotate = false;
cameraControl.enableZoom = false;

/*---------------------------------------------------------------------------------------------------- */

/* Parte do áudio do jogo */

const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// Som ambiente
var isPlaying = true; //Variável para ajudar a controlar o som ambiente!
const audioLoader = new THREE.AudioLoader();
audioLoader.load( './sounds/environmentSound.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.4 );
	sound.pause(); //Voltar para PLAY depois
});

//Som de tiro do avião
const soundAirship = new THREE.PositionalAudio( listener );
const audioLoaderAirship = new THREE.AudioLoader();
audioLoaderAirship.load( './sounds/blasterAirship.mp3', function( buffer ) {
	soundAirship.setBuffer( buffer );
	soundAirship.setRefDistance( 20 );
    soundAirship.setVolume(0.5);
	// soundAirship.play();
});

//Som de colisão da turret
const soundHitTurret = new THREE.PositionalAudio( listener );
const audioLoaderHitTurret = new THREE.AudioLoader();
audioLoaderHitTurret.load( './sounds/explosionTurret.mp3', function( buffer ) {
	soundHitTurret.setBuffer( buffer );
	soundHitTurret.setRefDistance( 20 );
    soundHitTurret.setVolume(0.9);
});


//Som de colisão do avião
const soundHitAirplane = new THREE.PositionalAudio( listener );
const audioLoaderHitAirplane = new THREE.AudioLoader();
audioLoaderHitAirplane.load( './sounds/hitAirship.mp3', function( buffer ) {
	soundHitAirplane.setBuffer( buffer );
	soundHitAirplane.setRefDistance( 20 );
    soundHitAirplane.setVolume(0.9);
});

/*---------------------------------------------------------------------------------------------*/

//-- CREATING THE EQUIRECTANGULAR MAP   ----------------------------------------------------------------------

const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( './textures/space_skybox.jpeg' );
	textureEquirec.mapping = THREE.EquirectangularReflectionMapping; // Reflection as default
	textureEquirec.encoding = THREE.sRGBEncoding;
// Set scene's background as a equirectangular map
scene.background = textureEquirec;

/*---------------------------------------------------------------------------------------------*/

/* Luz Direcional e Ambiente*/
let ambientColor = "rgb(100,100,100)";
let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add( ambientLight );

var light = new THREE.DirectionalLight(0xffffff, 1);

light.position.set(45, 65, 30); //Luz no X e Y positivos, sombra está a esquerda do avião.
light.shadow.mapSize.width = 5096;
light.shadow.mapSize.height = 2048;
light.castShadow = true; // Permite que a luz projete sombras
light.shadow.camera.left = -widthPlan/2;
light.shadow.camera.right = widthPlan/2 * 19;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = light.position.y + 150;
light.shadow.camera.top = 120;
light.shadow.camera.bottom = -120;
light.shadow.radius = 2;

light.target.position.set(-50,0,25);
light.target.updateMatrixWorld();

// --> HELPER DA LUZ
// const helper = new THREE.DirectionalLightHelper( light, 3, 0xffff00 );
// const shadowHelper = new THREE.CameraHelper(light.shadow.camera);

scene.add(light);
// scene.add(helper);
// scene.add(shadowHelper);

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
window.addEventListener("contextmenu", rightClick);
document.body.style.cursor = "none";


// -- Cria o raycaster que será usado para fazer interseção entre o plano e a posição do mouse
let raycaster = new THREE.Raycaster();

// Enable layers to raycaster and camera (layer 0 is enabled by default)
raycaster.layers.enable( 1 );//apenas os objetos que estão na camada 1 serão considerados como possíveis interseções

// Cria o plano que será usado para fazer interseção com o mouse
let invisiblePlane, planeGeometry, planeMaterial;

planeGeometry = new THREE.PlaneGeometry(widthPlan, sizeCube, 1, 1);
planeMaterial = new THREE.MeshPhongMaterial();
planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 0.;
invisiblePlane = new THREE.Mesh(planeGeometry, planeMaterial);
invisiblePlane.position.set(invisiblePlanePosition.x, invisiblePlanePosition.y, invisiblePlanePosition.z);

invisiblePlane.layers.set(1);  // change layer

scene.add(invisiblePlane);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
axesHelper.translateY(10)
scene.add(axesHelper);

var queue = new Queue();
var torretas = [];
// O oitavo plano será o que estará na parte de reposição.
for(var i = 0; i < numPlans; i++){
    var environment;
    if(i == 2 || i == 4 || i == 6 || i == 8){
        environment = new Environment(heightPlan, widthPlan, true, i);
    }else{
        environment = new Environment(heightPlan, widthPlan, false, i);
    }

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
        loaded: false,
        animation: false,
        initialScale: null,
        animationStartTime: 0,
        destroyed:false,
        plane: plane
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

        if(plane.position.z >= (5*heightPlan)/2){
            plane.position.z = ((3*heightPlan)/2 - (numPlans-1) * heightPlan) - ((5*heightPlan)/2 - plane.position.z);
            if(i == 2 || i == 4 || i == 6 || i == 8){
                if(torretas[i/2-1] != null && torretas[i/2-1].destroyed){ 
                    torretas[i/2-1].torreta.scale.set(6.72,6.72,6.72);
                    torretas[i/2-1].destroyed = false;
                }
            }
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
            // env.setOpacityTrees(0); //-> Não tem mais árvores
            if(env.getTurret() != null){
                env.getTurret().traverse( function( node ) {
                    if( node.material ) {
                        node.material.opacity = 0.0;
                        node.material.transparent = true;
                    }
                });
            }
        }
        if(n <= x && n >= y )
        {   
            env.setLeftCubeOpacity((n-y)/(heightPlan));
            env.setRightCubeOpacity((n-y)/(heightPlan));
            env.setPlaneOpacity((n-y)/(heightPlan));
            // env.setOpacityTrees((n-y)/(heightPlan)); //-> Não tem mais árvores
            if(env.getTurret() != null){
                env.getTurret().traverse( function( node ) {
                    if( node.material ) {
                        node.material.opacity = (n-y)/(heightPlan);
                        node.material.transparent = true;
                    }
                });
            }
        } else if (n > x){
            env.setLeftCubeOpacity(1);
            env.setRightCubeOpacity(1);
            env.setPlaneOpacity(1);
            // env.setOpacityTrees(1); //-> Não tem mais árvores
            if(env.getTurret() != null){
                env.getTurret().traverse( function( node ) {
                    if( node.material ) {
                        node.material.opacity = 1.0;
                        node.material.transparent = true;
                    }
                });
            }
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

            if(point.x>-45 && point.x<45 && point.y>5 && invisiblePlane == intersects[0].object ) {
                lerpConfig.destination.x = point.x;
                lerpConfig.destination.y = point.y;
            }
        }
    }
};

let sensibilidadeMouse = 0.05;
let velocidadeRetorno = 0.05;
let anguloX;
let anguloY;
let anguloZ;

/*
    Limitar angulo de rotação do avião
*/
function limitAngleRotation(angleOld, angleNew, maxAngle){
    if(angleOld<-maxAngle || angleOld>maxAngle){
        return 0;
    }
    return angleNew;
}


/**
 * Função para fazer a rotação do avião
 */
function rotateAirplane(){

    // Distância entre a posição do avião e do mouse
    let dist = Math.round(lerpConfig.destination.distanceTo(aviao.getAirplane().position));

    let distX = lerpConfig.destination.x - aviao.getAirplane().position.x;
    let distY = lerpConfig.destination.y - aviao.getAirplane().position.y;
    let distZ = lerpConfig.destination.z - aviao.getAirplane().position.z;

    //Para pegar o angulo atual do avião em cada eixo
    anguloX =  Math.round(aviao.getAirplane().rotation.x * 180 / Math.PI);
    anguloY =  Math.round(aviao.getAirplane().rotation.y * 180 / Math.PI);
    anguloZ =  Math.round(aviao.getAirplane().rotation.z * 180 / Math.PI);

    // console.log("Ângulo em graus em torno do eixo X: " + (anguloX));
    // console.log("Ângulo em graus em torno do eixo Y: " + anguloY);
    // console.log("Ângulo em graus em torno do eixo Z: " + (anguloZ));

    // aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(1));

    //rotaciono em x muda em x
    //rotaciono em y muda em y
    //rotaciono em z muda em z

    if(aviao.getAirplane() && dist > 4){
        //Fazer rotação em função da distancia, quant maior a distancia mais rapido rotaciona

        /*if(distX > 0){
            aviao.getAirplane().rotateX(THREE.MathUtils.degToRad(limitAngleRotation(anguloY+90, -distX * sensibilidadeMouse, 45)));
            aviao.getAirplane().rotateY(THREE.MathUtils.degToRad(limitAngleRotation(anguloY+90, -distX * sensibilidadeMouse*0.4, 10)));
        }else{
            aviao.getAirplane().rotateX(THREE.MathUtils.degToRad(limitAngleRotation(anguloY+90, -distX * sensibilidadeMouse,45)));
            aviao.getAirplane().rotateY(THREE.MathUtils.degToRad(limitAngleRotation(anguloY+90, -distX * sensibilidadeMouse*0.4, 10)));
        }

        if(distY > 0){
            aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(-distY*sensibilidadeMouse*0.6));
        }else{
            //limitAngleRotation(anguloX,-distY*sensibilidadeMouse*5,10)
            aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(-distY*sensibilidadeMouse*0.6));
        }*/

        //Rotação no eixo Z (quando o avião se move para esq/dir)
        if(distX > 0){//indo para a direita
            aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(distX * sensibilidadeMouse*0.4));
            aviao.getAirplane().rotateY(THREE.MathUtils.degToRad(distY * sensibilidadeMouse*0.01));
        }else {
            aviao.getAirplane().rotateZ(THREE.MathUtils.degToRad(distX * sensibilidadeMouse*0.4));
            aviao.getAirplane().rotateY(THREE.MathUtils.degToRad(distY * sensibilidadeMouse*0.01));
        }

        if(distY > 0){//indo para a direita
            aviao.getAirplane().rotateX(THREE.MathUtils.degToRad(-distY * sensibilidadeMouse*0.1));
        }else {
            aviao.getAirplane().rotateX(THREE.MathUtils.degToRad(-distY * sensibilidadeMouse*0.1));
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
        //aviao.getAirplane().rotateZ(0.1);
    }
}

/*
    Função para fazer pequenos movimentos na camera quando o avião chegar próximo às bordas
*/
function moveCamera() {
    if (aviao.getAirplane().position.x < -25) {
        if (cameraControl.target.x > -5) {
            cameraControl.update();
            cameraControl.target.x -= 0.1;
            // camera.position.x -= 0.1;
        }
    }

    if (aviao.getAirplane().position.x > 25) {
        if (cameraControl.target.x < 5) {
            cameraControl.update();
            cameraControl.target.x += 0.1;
            // camera.position.x += 0.1;
        }
    }

    //  console.log("Avião y : "+aviao.getAirplane().position.y)
    //  console.log("Camera Target y : "+cameraControl.target.y)
    // console.log("Camera position y : "+camera.position.y)
    
    //se o avião está muito pra cima, movo o target da camera para cima até 18
    if (aviao.getAirplane().position.y > 20) {
        if (cameraControl.target.y < 10) {
            cameraControl.update();
            cameraControl.target.y += 0.1;
            // camera.position.y += 0.1;
        }
    } else {
        //c.c, movo o target para baixo até 15

        if (cameraControl.target.y >5) {
            
            cameraControl.update();
            cameraControl.target.y -= 0.1;
            // camera.position.y -= 0.1;
        }
    }
}

function onMouseClick(event) {
    if(event.button == 0){
        if (!boolSimulation) boolSimulation = true;
        let obj = {
            bullet: null,
            dir: null,
            bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
            type:'a'
        }

        let bullet = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 2, 32, 32), new THREE.MeshPhongMaterial({
            color: "red"
        }));
        bullet.rotateX(THREE.MathUtils.degToRad(90));

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
        soundAirship.stop();
        soundAirship.play();
        bullets.push(obj);
    }
}

function rightClick(event) {
    if(event.button == 2){
        turretShoot();
    }
}

/*
    Função para disparar tiros da torreta a cada cadenciaTime segundos
*/
function turretShoot(){
    
    cadenciaTime += delta;

    //se não tiver passado os 3 segundos (cadenciaTime) a torreta não atira
    if(cadenciaTime < cadenciaTirosTorreta){
        return;
    }
    cadenciaTime = 0;
    torretas.forEach(conjunto => {
        //Adicionei esse conjunto.plane.position.z para verificar se a posição do negócio não está depois do avião.
        if(conjunto.torreta != null && conjunto.plane.position.z > 0){
            let obj = {
                bullet: null,
                dir: null,
                bb: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
                type:'t'
            }

            let bullet = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 2, 32, 32), new THREE.MeshPhongMaterial({
                color: "yellow"
            }));
            bullet.rotateX(THREE.MathUtils.degToRad(90));

            obj.bullet = bullet;
            obj.bb.setFromObject(obj.bullet);
            conjunto.torreta.getWorldPosition(bullet.position);

            var directionBullet = new THREE.Vector3();
            var posicaoTorreta = new THREE.Vector3();
            var posicaoAviao = new THREE.Vector3();

            conjunto.torreta.getWorldPosition(posicaoTorreta);
            aviao.getAirplane().getWorldPosition(posicaoAviao);

            // posicaoTorreta = conjunto.torreta.position;
            // posicaoAviao = aviao.getAirplane().position;

            directionBullet.subVectors(posicaoTorreta, posicaoAviao ).normalize();

            // const arrowHelper = new THREE.ArrowHelper( directionBullet, posicaoTorreta, 10, 0xffff00 );
            // scene.add( arrowHelper );

            //obj.dir = aviao.getAirplane().position.clone();
            obj.dir = directionBullet;
            bullets.push(obj);

            scene.add(bullet);
        }
    })
}

/*
    Realizar movimento das balas
*/
function updateBullets () {
    bullets.forEach(bulletObj => {
        if(bulletObj.type=='a'){
            bulletObj.bullet.position.x -= bulletObj.dir.getComponent(0) * bulletVelocity * delta;
            bulletObj.bullet.position.y -= bulletObj.dir.getComponent(1) * bulletVelocity * delta;
            bulletObj.bullet.position.z -= bulletObj.dir.getComponent(2) * bulletVelocity * delta;
        }else{
            //bulletObj.bullet.position.lerp(bulletObj.dir, bulletVelocity * delta*0.01)
            bulletObj.bullet.position.x -= bulletObj.dir.getComponent(0) * bulletVelocity * delta;
            bulletObj.bullet.position.y -= bulletObj.dir.getComponent(1) * bulletVelocity * delta;
            bulletObj.bullet.position.z -= bulletObj.dir.getComponent(2) * bulletVelocity * delta;
        }
        
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
    }else if ( keyboard.down("0") ){
        for(var i = 0; i < queue.size(); i++){
            queue.peek(i).changeVelocity(velocityPlan);
        }
    } 
    else if ( keyboard.down("1") ){
        for(var i = 0; i < queue.size(); i++){
            queue.peek(i).changeVelocity(2.);
        }
    } else if ( keyboard.down("2") ){
        for(var i = 0; i < queue.size(); i++){
            queue.peek(i).changeVelocity(3.);
        }
    } else if( keyboard.down("3") ){
        for(var i = 0; i < queue.size(); i++){
            queue.peek(i).changeVelocity(4.);
        }
    } else if( keyboard.down("S")){
        if(isPlaying){
            sound.stop();
            isPlaying = false;
        }else{
            sound.play();
            isPlaying = true;
        }
    }

}

function checkColisions(){
    cadenciaTime2 += delta;
    bullets.forEach( (bulletObj, indexBullet) => {
        if(bulletObj.type=='a'){// projétil do avião
            torretas.forEach ( (conjunto) => {
                if(conjunto.torreta != null){
                    if(bulletObj.bb.intersectsBox(conjunto.bb)){
                        conjunto.animation = true;
                        conjunto.initialScale = conjunto.torreta.scale.clone();
                        conjunto.animationStartTime = Date.now();
                        conjunto.destroyed = true;
                        soundHitTurret.stop();
                        soundHitTurret.play();
                        bullets.splice(indexBullet, 1);
                        scene.remove(bulletObj.bullet);
                    }
                }
            })
        }else{ // projétil da torreta
            
            if(bulletObj.bb.intersectsBox(aviao.getAirplane().bb)){
                //se não tiver passado os 3 segundos (cadenciaTime) a torreta não atira
                if(cadenciaTime2 < 0.1){
                    return;
                }
                cadenciaTime2 = 0;
                console.log('Chegou até aqui');
                soundHitAirplane.stop();
                soundHitAirplane.play();
                aviao.airplaneHit();
            }
        }
        
    })
}

const targetScale = new THREE.Vector3(0, 0, 0);
const animationDuration = 350; 

function removeBullet(bullet, index){
    if(bullet.position.y < 0 || bullet.position.y > heightPlan || bullet.position.x > widthPlan/2 || bullet.position.x < -widthPlan/2 || bullet.position.z < ((heightPlan)/2) - heightPlan *(numPlans-4) ) {
        bullets.splice(index, 1);
        scene.remove(bullet);
    }
}

render();
function render() {

    //console.log(camera)
    if (boolSimulation) {
        if (aviao.getAirplane()) {
            aviao.getAirplane().bb.setFromObject(aviao.getAirplane());
            bullets.forEach((bulletObj, index) => {
                bulletObj.bb.setFromObject(bulletObj.bullet);

                removeBullet(bulletObj.bullet, index);
            })
            torretas.forEach((conjunto, index) => {

                if (conjunto.torreta != null && !conjunto.loaded) {
                    conjunto.bb.setFromObject(conjunto.torreta);
                    conjunto.loaded = true;
                } else if (conjunto.torreta != null && conjunto.loaded) {
                    conjunto.bb.setFromObject(conjunto.torreta);
                } 
                
                
                if(conjunto.torreta != null && conjunto.animation == true){

                    if(conjunto.torreta.scale.equals( targetScale)){
                        conjunto.animation = false;
                    }else{
                        // Calcula o tempo decorrido desde o início da animação
                        const elapsedTime = Date.now() - conjunto.animationStartTime;

                        // Calcula a interpolação para a escala atual do cubo
                        const t = Math.min(elapsedTime / animationDuration, 1); // Limita o valor de t a 1
                        const currentScale = conjunto.initialScale.clone().lerp(targetScale, t);
                        
                        // Atualiza a escala da torreta
                        conjunto.torreta.scale.copy(currentScale);
                    }
                }
            })

            //For que preenche as torretas do conjunto.torreta para eles deixarem de ser nulos
            for (var i = 0; i < numPlans; i++) {
                var torretaAdd = queue.peek(i).getTurret();
                if (torretaAdd != null && torretas[i/2-1].torreta == null) {
                    torretas[i/2-1].torreta = torretaAdd;
                }
            }

            checkColisions();

            delta = clock.getDelta();
            turretShoot();
            updateBullets();

            moveAirPlane();


            moveCamera();

            updatePositionPlanes(); 
        }

        renderer.render(scene, camera) // Render scene
    }else{
        console.log(camera.position)
    }


    keyboardUpdate();

    requestAnimationFrame(render);

}