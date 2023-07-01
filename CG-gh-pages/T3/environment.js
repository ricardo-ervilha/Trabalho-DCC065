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

    constructor(height, width, temTorreta, texturasVar){

        this.texturasVar = texturasVar;

        const textureLoader = new THREE.TextureLoader();
        //-- Carregando as texturas da trench run
        this.map1 = textureLoader.load('./textures/map_1.jpeg');
        this.map2 = textureLoader.load('./textures/map_2.jpeg');
        this.map3 = textureLoader.load('./textures/map_3.jpeg');
        this.map4 = textureLoader.load('./textures/map_4.jpeg');
        this.map5 = textureLoader.load('./textures/map_5.jpeg');
        this.map6 = textureLoader.load('./textures/map_6.jpeg');
        this.map7 = textureLoader.load('./textures/map_7.jpeg');
        this.map8 = textureLoader.load('./textures/map_8.jpeg');
        this.map9 = textureLoader.load('./textures/map_9.jpeg');
        this.map10 = textureLoader.load('./textures/map_10.jpeg');
        this.map11 = textureLoader.load('./textures/map_11.jpeg');
        this.map12 = textureLoader.load('./textures/map_12.jpeg');
        this.map13 = textureLoader.load('./textures/map_13.jpeg');

        this.texture2 = textureLoader.load('./textures/texture2.jpg');
        this.texture8 = textureLoader.load('./textures/texture8.png');
        this.texture9 = textureLoader.load('./textures/texture9.png');
        
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
        this.plane.material.map = this.texture2;
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
        var material1 = new THREE.MeshPhongMaterial( {color: 0xdddddd, transparent: true} ); 
        var material2 = new THREE.MeshPhongMaterial( {color: 0xdddddd, transparent: true}) ;
        
        this.leftCube = new THREE.Mesh( geometry, material1 ); 
        this.leftCube.position.x = -widthPlan/2 - sizeCube/2;
        this.leftCube.receiveShadow = true;
        this.plane.add(this.leftCube);
        
        var edges = new THREE.EdgesGeometry( geometry ); 
        
        this.leftLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, linewidth: 5} ) ); 
        this.leftCube.add( this.leftLine );

        this.rightCube = new THREE.Mesh( geometry, material2);
        this.rightCube.receiveShadow = true;
        this.rightCube.position.x = widthPlan/2 + sizeCube/2;
        
        this.plane.add(this.rightCube);
        
        this.rightLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, linewidth: 5 }));


        //Parte das texturas
        if(this.texturasVar == 0){
            this.leftCube.material.map = this.texture9;
            this.rightCube.material.map = this.texture9;
        }else if(this.texturasVar == 1){
            this.leftCube.material.map = this.texture9;
            this.rightCube.material.map = this.texture9;
        }else if(this.texturasVar == 2){
            this.leftCube.material.map = this.map5;
            this.rightCube.material.map = this.map9;
        }else if(this.texturasVar == 3){
            this.leftCube.material.map = this.map10;
            this.rightCube.material.map = this.map13;
        }else if(this.texturasVar == 4){
            this.leftCube.material.map = this.map11;
            this.rightCube.material.map = this.map4;
        }else if(this.texturasVar == 5){
            this.leftCube.material.map = this.map13;
            this.rightCube.material.map = this.map6;
        }else if(this.texturasVar == 6){
            this.leftCube.material.map = this.map1;
            this.rightCube.material.map = this.map7;
        }else if(this.texturasVar == 7){
            this.leftCube.material.map = this.map5;
            this.rightCube.material.map = this.map3;
        }else if(this.texturasVar == 8){
            this.leftCube.material.map = this.map4;
            this.rightCube.material.map = this.map9;
        }

        this.leftCube.material.map.minFilter = THREE.LinearFilter;
        this.leftCube.material.map.magFilter = THREE.LinearFilter;
        this.rightCube.material.map.minFilter = THREE.LinearFilter;
        this.rightCube.material.map.magFilter = THREE.LinearFilter;
        
        this.rightCube.add( this.rightLine );
        
    }
    
    buildObjectsTrenchRun(){
        if(this.texturasVar == 0){

            //Coluna cilindrica vertical da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture2;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            var geometry = new THREE.CylinderGeometry(10, 10, sizeCube, 64, 64, undefined, undefined, Math.PI);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.position.x += sizeCube/2;
            cilindro1.position.y -= 25;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Coluna cilindrica vertical da direita
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture9;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            var cilindro2 = new THREE.Mesh(geometry, material2);
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            cilindro2.position.y -= 25;
            cilindro2.rotateY(THREE.MathUtils.degToRad(180));
            cilindro2.position.x -= sizeCube/2;
            this.rightCube.add(cilindro2);

        }else if(this.texturasVar == 1){

        }else if(this.texturasVar == 2){

        }else if(this.texturasVar == 3){
            //Coluna cilindrica vertical da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture2;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            var geometry = new THREE.CylinderGeometry(10, 10, sizeCube, 64, 64, undefined, undefined, Math.PI);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.position.x += sizeCube/2;
            cilindro1.position.y -= 25;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Coluna cilindrica vertical da direita
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture9;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            var cilindro2 = new THREE.Mesh(geometry, material2);
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            cilindro2.position.y -= 25;
            cilindro2.rotateY(THREE.MathUtils.degToRad(180));
            cilindro2.position.x -= sizeCube/2;
            this.rightCube.add(cilindro2);

        }else if(this.texturasVar == 4){

        }else if(this.texturasVar == 5){

        }else if(this.texturasVar == 6){
            //Coluna cilindrica vertical da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture2;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            var geometry = new THREE.CylinderGeometry(10, 10, sizeCube, 64, 64, undefined, undefined, Math.PI);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.position.x += sizeCube/2;
            cilindro1.position.y -= 25;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Coluna cilindrica vertical da direita
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture9;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            var cilindro2 = new THREE.Mesh(geometry, material2);
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            cilindro2.position.y -= 25;
            cilindro2.rotateY(THREE.MathUtils.degToRad(180));
            cilindro2.position.x -= sizeCube/2;
            this.rightCube.add(cilindro2);

            //Coluna cilindrica vertical da direita
            var material3 = new THREE.MeshPhongMaterial();
            material3.map = this.texture2;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            var geometry2 = new THREE.CylinderGeometry(26, 35, 4, 4, 1, undefined, undefined, undefined);
            var cilindro3 = new THREE.Mesh(geometry2, material3);
            cilindro3.rotateX(THREE.MathUtils.degToRad(90));
            cilindro3.position.z += sizeCube/2;
            cilindro3.rotateY(THREE.MathUtils.degToRad(45));
            this.rightCube.add(cilindro3);

        }else if(this.texturasVar == 7){

            //Disco em cima do cubo da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture9;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            var geometry = new THREE.CylinderGeometry(40, 40, 10, 64, 64);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.position.z += sizeCube/2;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

        }else if(this.texturasVar == 8){

        }
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