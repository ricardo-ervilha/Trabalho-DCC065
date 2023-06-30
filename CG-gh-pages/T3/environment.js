import * as THREE from  'three';
import { createGroundPlaneWired, getMaxSize } from "./util.js";
import { Tree } from './tree.js';
import { heightPlan, sizeCube, velocityPlan, widthPlan } from './variables.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { MeshBasicMaterial } from '../build/three.module.js';
/*
Classe responsável por modelar o ambiente com seus planos retangulares e cubos nas bordas.
Além disso, nela associamos as "turrets" que serão gerados no ambiente.
*/
export class Environment{
    static count = 0;
    static TurretPositionsGeneration = [
        [-widthPlan/2+15, heightPlan/2 - 15],
        [40, 30],
        [-10, -heightPlan/2 + 30],
        [7, 13]
    ];

    //Struct 1 -> Ter um cilindro dentro do outro semelhante ao que está no canto inferior esquerdo da imagem
    //Struct 2 -> Ter um Paralelepípedo com outros paralelepipedos do lado conectando a cubos. Meio e direita da imagem
    //Struct 3 -> Ter um paralelepípedo atravessando as paredes semelhante ao meio superior da imagem.
    constructor(height, width, temTorreta, numCubos, struct3, numCalotas, numCilindros, numParalelepipedos, struct1, struct2){
        const textureLoader = new THREE.TextureLoader();
        //-- Carregando as texturas da trench run
        this.texture1 = textureLoader.load('./textures/texture-1.jpg');
        this.texture2 = textureLoader.load('./textures/texture-2.jpg');
        this.texture3 = textureLoader.load('./textures/texture-3.jpg');
        this.texture4 = textureLoader.load('./textures/texture-4.jpg');
        this.texture5 = textureLoader.load('./textures/texture-5.jpg');
        this.texture6 = textureLoader.load('./textures/texture-6.png');
        this.texture7 = textureLoader.load('./textures/teste2.jpg');

        this.auxObjectsTrenchRun = {
            numCubos: numCubos,
            numCalotas: numCalotas,
            numCilindros: numCilindros,
            numParalelepipedos: numParalelepipedos,
            struct1: struct1,
            struct2: struct2,
            struct3: struct3
        }
        
        //Controla a velocidade do plano
        this.velocity = velocityPlan;

        this.turret = null;

        // this.trees = []; -> Não tem mais árvores

        this.height = height;
        this.width = width;
        
        let obj = createGroundPlaneWired(width, height, 10, 10, 3, "rgb(80, 80, 80)", "rgb(204, 204, 204)");
        
        //Desempacoto obj e pego o plano, setando a opacidade para 0
        this.plane = obj.plane;
        this.plane.material.transparent = true;
        this.plane.material.map = this.texture4;
        this.plane.material.map.minFilter = THREE.LinearFilter;
        this.plane.material.map.magFilter = THREE.NearestFilter;
        
        this.plane.material.opacity = 0;

        //Desempacoto obj e pego o grid, setando a opacidade para 0
        this.grid = obj.grid;
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0;

        this.leftCube = null;
        this.rightCube = null;
        this.leftLine = null;
        this.rightLine = null;

        this.conectCubesPlane();
        if(temTorreta){
            this.buildOneTurret();    
        }

        this.buildObjectsTrenchRun();
        // this.buildTrees(); //-> Não tem mais árvores
    }

    conectCubesPlane(){
        //Usar isso para criar os cubos com arestas.
        var geometry = new THREE.BoxGeometry( sizeCube, sizeCube, sizeCube ); 
        var material = new THREE.MeshPhongMaterial( {color: 0xdddddd, transparent: true} ); 
        
        this.leftCube = new THREE.Mesh( geometry, material ); 
        this.leftCube.position.x = -widthPlan/2 - sizeCube/2;
        this.leftCube.receiveShadow = true;
        this.plane.add(this.leftCube);
        
        var edges = new THREE.EdgesGeometry( geometry ); 
        
        this.leftLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, linewidth: 5} ) ); 
        this.leftCube.add( this.leftLine );

        this.rightCube = new THREE.Mesh( geometry, material);
        this.rightCube.receiveShadow = true;
        this.rightCube.position.x = widthPlan/2 + sizeCube/2;
        
        this.plane.add(this.rightCube);
        
        this.rightLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, linewidth: 5 }));

        this.leftCube.material.map = this.texture2;
        this.rightCube.material.map = this.texture2;
        this.leftCube.material.map.minFilter = THREE.LinearFilter;
        this.leftCube.material.map.magFilter = THREE.NearestFilter;
        this.rightCube.material.map.minFilter = THREE.LinearFilter;
        this.rightCube.material.map.magFilter = THREE.NearestFilter;
        
        this.rightCube.add( this.rightLine );

    }

    //-> Não tem mais árvores
    // getRandomArbitrary(min, max) {
    //     return Math.random() * (max - min) + min;
    // }

    //-> Não tem mais árvores
    // verificationDistanceTrees(x,y){
    //     let dist;
    //     for(var i = 0; i < this.trees.length; i++){
    //         dist = Math.sqrt(Math.pow(x-this.trees[i].position[0], 2) + Math.pow(y-this.trees[i].position[1], 2));
    //         if(dist <= 14)
    //             return true;
    //     }
    //     return false;
    // }

    //-> Não tem mais árvores
    // verificationDistanceTurret(x,y){
    //     let dist;
    //     for(var i = 0; i < Environment.TurretPositionsGeneration.length; i++){
    //         dist = Math.sqrt(Math.pow(x - Environment.TurretPositionsGeneration[i][0], 2) + Math.pow(y - Environment.TurretPositionsGeneration[i][1], 2));
    //         if(dist <= 16)
    //             return true;
    //     }
    //     return false;
    // }

    //-> Não tem mais árvores
    // buildTrees(){
    //     let x, y;
    //     for(var i = 0; i < 3; i++){
    //         let treeInstance =  new Tree();
    //         let tree = treeInstance.getFoundation();
    //         tree.rotateX(THREE.MathUtils.degToRad(90));
    //         x = this.getRandomArbitrary(-widthPlan/2 + 5, widthPlan/2 - 5);
    //         y = this.getRandomArbitrary(-heightPlan/2 + 5, heightPlan/2 -5 );
    //         while(this.verificationDistanceTrees(x, y) || this.verificationDistanceTurret(x,y)){
    //             x = this.getRandomArbitrary(-widthPlan/2 + 5, widthPlan/2 - 5);
    //             y = this.getRandomArbitrary(-heightPlan/2 + 5, heightPlan/2 - 5);
    //         }
    //         tree.position.set(x, y, 2.5);
    //         this.plane.add(tree);
    //         let obj = {
    //             treeObj: treeInstance,
    //             position: [x,y]
    //         }
    //         this.trees.push(obj);
    //     }
    // }

    buildObjectsTrenchRun(){
        let x, y;
        var geometry;

        if(this.auxObjectsTrenchRun.numCubos){
            geometry = new THREE.BoxGeometry(25,25,25);
            var material = new THREE.MeshLambertMaterial();
            const cube = new THREE.Mesh(geometry, material);
            this.leftCube.add(cube);
            cube.position.z += heightPlan/2 + 30/2;
            cube.material.map = this.texture1;
            cube.material.map.minFilter = THREE.LinearFilter;
            cube.material.map.magFilter = THREE.NearestFilter;
        }if(this.auxObjectsTrenchRun.struct3){
            geometry = new THREE.BoxGeometry(widthPlan,10,10);
            var material2 = new THREE.MeshLambertMaterial();
            const paralelepipedoAtravessado = new THREE.Mesh(geometry, material2);
            this.leftCube.add(paralelepipedoAtravessado);
            paralelepipedoAtravessado.position.z += heightPlan/2 - 30;
            paralelepipedoAtravessado.position.x += 3*widthPlan/2;
            paralelepipedoAtravessado.material.map = this.texture7;
            paralelepipedoAtravessado.material.map.minFilter = THREE.LinearFilter;
            paralelepipedoAtravessado.material.map.magFilter = THREE.NearestFilter;
        }
    }

    buildOneTurret() {
            var objLoader = new OBJLoader();

            objLoader.load("./assets/turret2.obj", (obj) => {

                obj.visible = true;
                obj.traverse(function (child) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                });

                obj.traverse(function (node) {
                    if (node.material) node.material.side = THREE.DoubleSide;
                });

                var obj = this.normalizeAndRescale(obj, 25);
                this.turret = obj;
                this.turret.rotateX(THREE.MathUtils.degToRad(90));
                this.turret.rotateY(THREE.MathUtils.degToRad(90));
                this.turret.transparent = true;

                this.turret.position.set(Environment.TurretPositionsGeneration[Environment.count][0], Environment.TurretPositionsGeneration[Environment.count][1], this.turret.position.z);
                Environment.count++;

                this.plane.add(this.turret);
            });
    }

    //-> Não tem mais árvores
    // setOpacityTrees(val){
    //     this.trees.forEach(element => {
    //         element.treeObj.setOpacity(val);
    //     });
    // }

    normalizeAndRescale(obj, newScale) {
    
        //Normaliza o objeto e multiplica por uma nova escala
        var scale = getMaxSize(obj);
        obj.scale.set(newScale * (1.0 / scale),
            newScale * (1.0 / scale),
            newScale * (1.0 / scale));
        return obj;
    }
    setLeftCubeOpacity(opacity){
        this.leftCube.material.opacity = opacity;
        this.leftLine.material.opacity = opacity;
    }

    setRightCubeOpacity(opacity){
        this.rightCube.material.opacity = opacity;
        this.rightLine.material.opacity = opacity;
    }

    setPlaneOpacity(opacity){
        this.plane.material.opacity = opacity;
        // this.grid.material.opacity = opacity;
    }

    //Retorna o plano
    getPlane(){
        return this.plane;
    }

    getTurret(){
        return this.turret;
    }

    getGrid(){
        return this.grid;
    }

    changeVelocity(velocity){
        this.velocity = velocity;
    }

    //Movimenta a posição do plano
    move(){
        this.plane.position.z += this.velocity;
    }
}