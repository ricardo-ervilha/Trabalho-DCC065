import * as THREE from 'three';
import { createGroundPlaneWired, getMaxSize } from "./util.js";
import { Tree } from './tree.js';
import { heightPlan, sizeCube, velocityPlan, widthPlan } from './variables.js';
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import { MathUtils, MeshBasicMaterial } from '../build/three.module.js';
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
/*
Classe responsável por modelar o ambiente com seus planos retangulares e cubos nas bordas.
Além disso, nela associamos as "turrets" que serão gerados no ambiente.
*/
export class Environment {
    static count = 0;
    static TurretPositionsGeneration = [
        [-widthPlan / 2 + 15, heightPlan / 2 - 15, 6],
        [40, 30, 11],
        [-10, -heightPlan / 2 + 30, 4],
        [7, 13, 8]
    ];

    constructor(height, width, temTorreta, texturasVar, manager) {

        this.objectsTextured = [];

        this.texturasVar = texturasVar;

        this.manager = manager;

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

        this.texture1 = textureLoader.load('./textures/texture1.jpg');
        this.texture2 = textureLoader.load('./textures/texture2.jpg');
        this.texture3 = textureLoader.load('./textures/texture3.jpg');
        this.texture4 = textureLoader.load('./textures/texture4.jpg');
        this.texture5 = textureLoader.load('./textures/texture5.jpg');
        this.texture6 = textureLoader.load('./textures/texture6.png');
        this.texture7 = textureLoader.load('./textures/texture7.jpg');
        this.texture8 = textureLoader.load('./textures/texture8.png');
        this.texture9 = textureLoader.load('./textures/texture9.png');

        //Controla a velocidade do plano
        this.velocity = velocityPlan;

        this.turret = null;

        // this.trees = []; -> Não tem mais árvores

        this.height = height;
        this.width = width;
        
        let obj = createGroundPlaneWired(width, height, 10, 10, 3, "rgb(255, 255, 255)", "rgb(255, 255, 255)");
        
        //Desempacoto obj e pego o plano, setando a opacidade para 0
        this.plane = obj.plane;
        this.plane.material.transparent = true;
        this.plane.material.map = this.texture1;
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
        if (temTorreta) {
            this.buildOneTurret();
        }

        this.buildObjectsTrenchRun();
        // this.buildTrees(); //-> Não tem mais árvores
    }

    conectCubesPlane() {
        //Usar isso para criar os cubos com arestas.
        var geometry = new THREE.BoxGeometry(sizeCube, sizeCube, sizeCube);
        var material1 = new THREE.MeshPhongMaterial({ color: 0xdddddd, transparent: true });
        var material2 = new THREE.MeshPhongMaterial({ color: 0xdddddd, transparent: true });

        this.leftCube = new THREE.Mesh(geometry, material1);
        this.leftCube.position.x = -widthPlan / 2 - sizeCube / 2;
        this.leftCube.receiveShadow = true;
        this.plane.add(this.leftCube);

        var edges = new THREE.EdgesGeometry(geometry);

        this.leftLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, linewidth: 5 }));
        //this.leftCube.add( this.leftLine );

        this.rightCube = new THREE.Mesh(geometry, material2);
        this.rightCube.receiveShadow = true;
        this.rightCube.position.x = widthPlan / 2 + sizeCube / 2;

        this.plane.add(this.rightCube);

        this.rightLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, linewidth: 5 }));


        //Parte das texturas

        this.leftCube.material.map = this.texture1;
        this.leftCube.material.map.wrapS = THREE.RepeatWrapping;
        this.leftCube.material.map.wrapT = THREE.RepeatWrapping;
        this.leftCube.material.map.repeat.set(0.7, 0.7);

        this.rightCube.material.map = this.texture1;
        this.rightCube.material.map.wrapS = THREE.RepeatWrapping;
        this.rightCube.material.map.wrapT = THREE.RepeatWrapping;
        this.rightCube.material.map.repeat.set(0.7, 0.7);



        this.leftCube.material.map.minFilter = THREE.LinearFilter;
        this.leftCube.material.map.magFilter = THREE.LinearFilter;
        this.rightCube.material.map.minFilter = THREE.LinearFilter;
        this.rightCube.material.map.magFilter = THREE.LinearFilter;

        //this.rightCube.add( this.rightLine );

    }

    buildObjectsTrenchRun() {
        if (this.texturasVar == 0) {
            //Coluna cilindrica vertical da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture1;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.9, 0.9);
            var geometry = new THREE.CylinderGeometry(10, 10, sizeCube, 64, 64, undefined, undefined, Math.PI);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.material.transparent = true;
            cilindro1.position.x += sizeCube / 2;
            cilindro1.position.y -= 25;
            this.objectsTextured.push(cilindro1);
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Coluna cilindrica vertical da direita
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture1;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.9, 0.9);
            var cilindro2 = new THREE.Mesh(geometry, material2);
            this.objectsTextured.push(cilindro2);
            cilindro2.material.transparent = true;
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            cilindro2.position.y -= 25;
            cilindro2.rotateY(THREE.MathUtils.degToRad(180));
            cilindro2.position.x -= sizeCube / 2;
            this.rightCube.add(cilindro2);

            //Paralelepípedo que fica em cima da parede direita.
            var material3 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material3.map = this.texture8;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry2, material3);
            this.objectsTextured.push(placa1);
            placa1.material.transparent = true;
            placa1.position.z += sizeCube / 2;
            placa1.position.y += 10;
            placa1.position.x -= 25;
            this.rightCube.add(placa1);

            //Paralelepípedo que fica em cima da parede esquerda.
            var material4 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material4.map = this.texture8;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(100, 20, 5);
            var placa2 = new THREE.Mesh(geometry3, material3);
            this.objectsTextured.push(placa2);
            placa2.material.transparent = true;
            placa2.position.z += sizeCube / 2;
            placa2.position.y += 10;
            placa2.position.x -= 25;
            this.leftCube.add(placa2);

        } else if (this.texturasVar == 1) {
            this.addObjectsToPlan(this.texturasVar);
            //Cubo que fica em cima do plano.
            var material1 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material1.map = this.texture2;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.5, 0.5);
            var geometry1 = new THREE.BoxGeometry(6, 6, 6);
            var cubo1 = new THREE.Mesh(geometry1, material1);
            this.objectsTextured.push(cubo1);
            cubo1.material.transparent = true;
            cubo1.position.z += 3;
            this.plane.add(cubo1);

            //Paralelepípedo que fica em cima do plano.
            var geometry2 = new THREE.BoxGeometry(20, 20, 2);
            var cubo2 = new THREE.Mesh(geometry2, material1);
            this.objectsTextured.push(cubo2);
            cubo2.material.transparent = true;
            cubo2.position.z += 3;
            cubo2.position.y -= 40;
            cubo2.position.x += 25;
            this.plane.add(cubo2);

            //Paralelepípedo que fica em cima da parede direita.
            var material2 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material2.map = this.texture2;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry3, material2);
            this.objectsTextured.push(placa1);
            placa1.material.transparent = true;
            placa1.position.z += sizeCube / 2;
            placa1.position.y += 35;
            placa1.position.x += 35;
            this.rightCube.add(placa1);

            //Paralelepípedo que fica em cima da parede esquerda.
            var material3 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material3.map = this.texture2;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry4 = new THREE.BoxGeometry(100, 20, 5);
            var placa2 = new THREE.Mesh(geometry4, material3);
            this.objectsTextured.push(placa2);
            placa2.material.transparent = true;
            placa2.position.z += sizeCube / 2;
            placa2.position.y += 10;
            placa2.position.x -= 25;
            placa2.rotateZ(THREE.MathUtils.degToRad(90));
            this.leftCube.add(placa2);

            //Estrutura que fica na parede da esquerda
            var material4 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material4.map = this.texture2;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry5 = new THREE.BoxGeometry(20, 20, 3);
            var placa2 = new THREE.Mesh(geometry5, material4);
            this.objectsTextured.push(placa2);
            var placa3 = new THREE.Mesh(geometry5, material4);
            placa3.material.transparent = true;
            this.objectsTextured.push(placa3);
            placa2.position.z += 30;
            placa2.position.y -= 30;
            placa2.position.x += sizeCube / 2;
            placa2.rotateX(THREE.MathUtils.degToRad(90));
            placa3.position.z += 30;
            placa3.position.y += 30;
            placa3.position.x += sizeCube / 2;
            placa3.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(placa2);
            this.leftCube.add(placa3);

            var geometry6 = new THREE.BoxGeometry(60, 5, 5);
            var ligamento1 = new THREE.Mesh(geometry6, material4);
            this.objectsTextured.push(ligamento1);
            var ligamento2 = new THREE.Mesh(geometry6, material4);
            this.objectsTextured.push(ligamento2);
            ligamento1.material.transparent = true;
            ligamento2.material.transparent = true;
            ligamento1.position.z += 25;
            ligamento1.position.y -= 0;
            ligamento1.position.x += sizeCube / 2 + 5;
            ligamento1.rotateZ(THREE.MathUtils.degToRad(90));
            ligamento2.position.z += 35;
            ligamento2.position.y -= 0;
            ligamento2.position.x += sizeCube / 2 + 5;
            ligamento2.rotateZ(THREE.MathUtils.degToRad(90));
            this.leftCube.add(ligamento1);
            this.leftCube.add(ligamento2);

            var material5 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material5.map = this.texture9;
            material5.map.magFilter = THREE.LinearFilter;
            material5.map.minFilter = THREE.LinearFilter;
            material5.map.wrapS = THREE.RepeatWrapping;
            material5.map.wrapT = THREE.RepeatWrapping;
            material5.map.repeat.set(0.5, 0.5);
            var geometry7 = new THREE.CylinderGeometry(3, 3, 1, 64, 64);
            var pino1 = new THREE.Mesh(geometry7, material5);
            this.objectsTextured.push(pino1);
            pino1.material.transparent = true;
            pino1.position.z += 30;
            pino1.position.y -= 34;
            pino1.position.x += sizeCube / 2 + 5;
            this.leftCube.add(pino1);

            //Estrutura que fica na parede direita.
            var material6 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material6.map = this.texture7;
            material6.map.magFilter = THREE.LinearFilter;
            material6.map.minFilter = THREE.LinearFilter;
            material6.map.wrapS = THREE.RepeatWrapping;
            material6.map.wrapT = THREE.RepeatWrapping;
            material6.map.repeat.set(0.5, 0.5);
            var geometry8 = new THREE.BoxGeometry(80, 40, 5);
            var placa4 = new THREE.Mesh(geometry8, material6);
            placa4.material.transparent = true;
            this.objectsTextured.push(placa4);
            placa4.position.x -= sizeCube / 2;
            placa4.position.z += 40;
            placa4.rotateY(THREE.MathUtils.degToRad(90));
            this.rightCube.add(placa4);

            var material7 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material7.map = this.texture4;
            material7.map.magFilter = THREE.LinearFilter;
            material7.map.minFilter = THREE.LinearFilter;
            material7.map.wrapS = THREE.RepeatWrapping;
            material7.map.wrapT = THREE.RepeatWrapping;
            material7.map.repeat.set(0.5, 0.5);
            var geometry9 = new THREE.CylinderGeometry(5, 5, 10, 64, 64);
            var cilindro1 = new THREE.Mesh(geometry9, material7);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            var cilindro2 = new THREE.Mesh(geometry9, material7);
            cilindro2.material.transparent = true;
            this.objectsTextured.push(cilindro2);
            var cilindro3 = new THREE.Mesh(geometry9, material7);
            cilindro3.material.transparent = true;
            this.objectsTextured.push(cilindro3);
            cilindro1.position.x -= sizeCube / 2 + 5;
            cilindro2.position.x -= sizeCube / 2 + 5
            cilindro1.position.z += 10;
            cilindro2.position.z += 40;
            cilindro3.position.z += 60;
            cilindro3.position.x -= sizeCube / 2 + 5
            // cilindro1.position.z += 70;
            cilindro1.rotateZ(THREE.MathUtils.degToRad(90));
            cilindro2.rotateZ(THREE.MathUtils.degToRad(90));
            cilindro3.rotateZ(THREE.MathUtils.degToRad(90));
            this.rightCube.add(cilindro1);
            this.rightCube.add(cilindro2);
            this.rightCube.add(cilindro3);


        } else if (this.texturasVar == 2) {

            //Cubo que fica em cima do plano.
            var material3 = new THREE.MeshPhongMaterial({ color: "#474849" });
            material3.map = this.texture2;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(20, 20, 11);
            var cubo4 = new THREE.Mesh(geometry3, material3);
            cubo4.material.transparent = true;
            this.objectsTextured.push(cubo4);
            // cubo1.position.z += 3;
            cubo4.position.x = -widthPlan / 2 + 15;
            cubo4.position.y = heightPlan / 2 - 15;
            this.plane.add(cubo4);

            //Calota esférica em cima do cubo da esquerda
            var material1 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material1.map = this.texture2;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.5, 0.5);
            var geometry1 = new THREE.SphereGeometry(12, 64, 64);
            var esfera1 = new THREE.Mesh(geometry1, material1);
            esfera1.material.transparent = true;
            this.objectsTextured.push(esfera1);
            esfera1.position.z += sizeCube / 2;
            this.leftCube.add(esfera1);

            //Cubo que fica na parede esquerda.
            var material2 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material2.map = this.texture5;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.BoxGeometry(10, 10, 10);
            var cubo2 = new THREE.Mesh(geometry2, material2);
            cubo2.material.transparent = true;
            this.objectsTextured.push(cubo2);
            cubo2.position.x += sizeCube / 2;
            cubo2.position.z += 50;
            this.leftCube.add(cubo2);

            //Cubo que fica na parede esquerda.
            var cubo3 = new THREE.Mesh(geometry2, material2);
            cubo3.material.transparent = true;
            this.objectsTextured.push(cubo3);
            
            cubo3.position.x += sizeCube / 2;
            cubo3.position.z += 93;
            this.leftCube.add(cubo3);

            //Cilindro no plano (Mais externo)
            var material4 = new THREE.MeshPhongMaterial({ color: "#474747" });
            material4.map = this.texture2;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry4 = new THREE.CylinderGeometry(6, 6, 10, 64, 64);
            var cilindro1 = new THREE.Mesh(geometry4, material4);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(cilindro1);

            //Cilindro no plano (Mais interno)
            var geometry5 = new THREE.CylinderGeometry(3, 3, 25, 64, 64);
            var cilindro2 = new THREE.Mesh(geometry5, material4);
            cilindro2.material.transparent = true;
            this.objectsTextured.push(cilindro2);
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(cilindro2);

            //Paralelepípedo que fica em cima do cubo da direita.
            var material5 = new THREE.MeshPhongMaterial();
            material5.map = this.texture4;
            material5.map.magFilter = THREE.LinearFilter;
            material5.map.minFilter = THREE.LinearFilter;
            material5.map.wrapS = THREE.RepeatWrapping;
            material5.map.wrapT = THREE.RepeatWrapping;
            material5.map.repeat.set(0.5, 0.5);
            var geometry6 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry6, material5);
            placa1.material.transparent = true;
            this.objectsTextured.push(placa1);
            placa1.position.z += sizeCube / 2;
            placa1.position.y -= 0;
            placa1.position.x -= sizeCube / 2 - 20;
            this.rightCube.add(placa1);

            //Paralelepípedo que fica em cima da parede esquerda.
            var material6 = new THREE.MeshPhongMaterial();
            material6.map = this.texture1;
            material6.map.magFilter = THREE.LinearFilter;
            material6.map.minFilter = THREE.LinearFilter;
            material6.map.wrapS = THREE.RepeatWrapping;
            material6.map.wrapT = THREE.RepeatWrapping;
            material6.map.repeat.set(0.5, 0.5);
            var geometry7 = new THREE.BoxGeometry(100, 20, 5);
            var placa2 = new THREE.Mesh(geometry7, material6);
            placa2.material.transparent = true;
            this.objectsTextured.push(placa2);
            placa2.position.z += sizeCube / 2;
            placa2.position.y += 30;
            placa2.position.x -= 25;
            this.leftCube.add(placa2);

        } else if (this.texturasVar == 3) {

            //Coluna cilindrica vertical da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture1;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.9, 0.9);
            var geometry = new THREE.CylinderGeometry(10, 10, sizeCube, 64, 64, undefined, undefined, Math.PI);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            cilindro1.position.x += sizeCube / 2;
            cilindro1.position.y -= 25;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Coluna cilindrica vertical da direita
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture1;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.9, 0.9);
            var cilindro2 = new THREE.Mesh(geometry, material2);
            cilindro2.material.transparent = true;
            this.objectsTextured.push(cilindro2);
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            cilindro2.position.y -= 25;
            cilindro2.rotateY(THREE.MathUtils.degToRad(180));
            cilindro2.position.x -= sizeCube / 2;
            this.rightCube.add(cilindro2);

            //Tronco de pirâmide em cima do cubo da direita
            var material3 = new THREE.MeshPhongMaterial();
            material3.map = this.map10;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.CylinderGeometry(18, 26, 30, 4, 1, undefined, undefined, undefined);
            var cilindro3 = new THREE.Mesh(geometry2, material3);
            cilindro3.material.transparent = true;
            this.objectsTextured.push(cilindro3);
            cilindro3.rotateX(THREE.MathUtils.degToRad(90));
            cilindro3.position.z += sizeCube / 2;
            cilindro3.rotateY(THREE.MathUtils.degToRad(45));
            this.leftCube.add(cilindro3);

            //Paralelepípedo que fica em cima da parede direita.
            var material4 = new THREE.MeshPhongMaterial();
            material4.map = this.texture2;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(40, 40, 30);
            var placa1 = new THREE.Mesh(geometry3, material3);
            placa1.material.transparent = true;
            this.objectsTextured.push(placa1);
            placa1.position.z += sizeCube / 2;
            placa1.position.y -= 0;
            placa1.position.x -= 0;
            this.rightCube.add(placa1);

            //Paralelepípedo que fica em cima da parede esquerda.
            var material5 = new THREE.MeshPhongMaterial();
            material5.map = this.texture5;
            material5.map.magFilter = THREE.LinearFilter;
            material5.map.minFilter = THREE.LinearFilter;
            material5.map.wrapS = THREE.RepeatWrapping;
            material5.map.wrapT = THREE.RepeatWrapping;
            material5.map.repeat.set(0.5, 0.5);
            var geometry4 = new THREE.BoxGeometry(100, 20, 5);
            
            var placa2 = new THREE.Mesh(geometry4, material5);
            placa2.material.transparent = true;
            this.objectsTextured.push(placa2);
            placa2.position.z += sizeCube / 2;
            placa2.position.y += 10;
            placa2.position.x -= 35;
            placa2.rotateZ(THREE.MathUtils.degToRad(90));
            this.leftCube.add(placa2);

        } else if (this.texturasVar == 4) {
            this.addObjectsToPlan(this.texturasVar);
            //Cubo que fica em cima do plano.
            var material6 = new THREE.MeshPhongMaterial({ color: "#474849" });
            material6.map = this.texture2;
            material6.map.magFilter = THREE.LinearFilter;
            material6.map.minFilter = THREE.LinearFilter;
            material6.map.wrapS = THREE.RepeatWrapping;
            material6.map.wrapT = THREE.RepeatWrapping;
            material6.map.repeat.set(0.5, 0.5);
            var geometry6 = new THREE.BoxGeometry(20, 20, 21);
            var cubo5 = new THREE.Mesh(geometry6, material6);
            cubo5.material.transparent = true;
            this.objectsTextured.push(cubo5);
            // cubo1.position.z += 3;
            cubo5.position.x = 40;
            cubo5.position.y = 30;
            this.plane.add(cubo5);

            //Paralelepípedo que fica em cima do plano.
            var material3 = new THREE.MeshPhongMaterial({ color: "#222222" });
            material3.map = this.texture2;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(widthPlan, 10, 3);
            var paralelepipedo1 = new THREE.Mesh(geometry3, material3);
            paralelepipedo1.material.transparent = true;
            this.objectsTextured.push(paralelepipedo1);
            paralelepipedo1.position.z += 1.5;
            paralelepipedo1.position.y -= 45;
            this.plane.add(paralelepipedo1);


            //Tronco de pirâmide em cima do cubo da esquerda
            var material = new THREE.MeshPhongMaterial({ color: "#707070" });
            material.map = this.texture7;
            material.map.magFilter = THREE.LinearFilter;
            material.map.minFilter = THREE.LinearFilter;
            material.map.wrapS = THREE.RepeatWrapping;
            material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set(0.5, 0.5);
            var geometry1 = new THREE.CylinderGeometry(35, 45, 7, 4, 1, undefined, undefined, undefined);
            var cilindro1 = new THREE.Mesh(geometry1, material);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            cilindro1.position.z += sizeCube / 2;
            cilindro1.position.x += 35;
            cilindro1.rotateY(THREE.MathUtils.degToRad(45));
            this.leftCube.add(cilindro1);


            //Cubo que fica em cima do tronco de pirâmide 
            var material2 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material2.map = this.texture7;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.BoxGeometry(25, 25, 25);
            var cubo1 = new THREE.Mesh(geometry2, material2);
            cubo1.material.transparent = true;
            this.objectsTextured.push(cubo1);
            cubo1.position.y += 16.5;
            cubo1.rotateY(THREE.MathUtils.degToRad(45));
            cubo1.position.x += 5;
            cubo1.position.z += 10;
            cilindro1.add(cubo1);

            //Cubos que ficam na parede direita.
            var material4 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material4.map = this.texture8;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry4 = new THREE.BoxGeometry(10, 10, 10);
            var cubo2 = new THREE.Mesh(geometry4, material4);
            cubo2.material.transparent = true;
            this.objectsTextured.push(cubo2);
            cubo2.position.x -= sizeCube / 2;
            cubo2.position.z += 93;
            this.rightCube.add(cubo2);

            var cubo3 = new THREE.Mesh(geometry4, material4);
            cubo3.material.transparent = true;
            this.objectsTextured.push(cubo3);
            cubo3.position.x -= sizeCube / 2;
            cubo3.position.z += 93;
            cubo3.position.y += 30;
            this.rightCube.add(cubo3);

            var cubo4 = new THREE.Mesh(geometry4, material4);
            cubo4.material.transparent = true;
            this.objectsTextured.push(cubo4);
            cubo4.position.x -= sizeCube / 2;
            cubo4.position.z += 93;
            cubo4.position.y -= 30;
            this.rightCube.add(cubo4);

            //Disco em cima do cubo da direita
            var material5 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material5.map = this.texture9;
            material5.map.magFilter = THREE.LinearFilter;
            material5.map.minFilter = THREE.LinearFilter;
            material5.map.wrapS = THREE.RepeatWrapping;
            material5.map.wrapT = THREE.RepeatWrapping;
            material5.map.repeat.set(0.5, 0.5);
            var geometry5 = new THREE.CylinderGeometry(20, 20, 10, 64, 64);
            var cilindro2 = new THREE.Mesh(geometry5, material5);
            cilindro2.material.transparent = true;
            this.objectsTextured.push(cilindro2);
            cilindro2.position.z += sizeCube / 2;
            cilindro2.position.x -= 40;
            cilindro2.position.y -= 40;
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            this.rightCube.add(cilindro2);

            //Paralelepípedo que fica em cima da parede direita.
            var geometry6 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry6, material5);
            placa1.material.transparent = true;
            this.objectsTextured.push(placa1);
            placa1.position.z += sizeCube / 2;
            placa1.position.y += 30;
            placa1.position.x -= sizeCube / 2 - 20;
            this.rightCube.add(placa1);

            //Cubo que fica em cima da parede esquerda.
            var material7 = new THREE.MeshPhongMaterial();
            material7.map = this.map7;
            material7.map.magFilter = THREE.LinearFilter;
            material7.map.minFilter = THREE.LinearFilter;
            material7.map.wrapS = THREE.RepeatWrapping;
            material7.map.wrapT = THREE.RepeatWrapping;
            material7.map.repeat.set(0.5, 0.5);
            var geometry7 = new THREE.BoxGeometry(30, 30, 30);
            var cubo5 = new THREE.Mesh(geometry7, material7);
            cubo5.material.transparent = true;
            this.objectsTextured.push(cubo5);
            cubo5.position.z += sizeCube / 2 + 15;
            cubo5.position.y += 10;
            cubo5.position.x -= 35;
            cubo5.rotateZ(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cubo5);


        } else if (this.texturasVar == 5) {

            //Cilindro deitado na parede da esquerda (Mais externo)
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture1;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(5, 5, 10, 64, 64);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            cilindro1.position.x += sizeCube / 2 + 5;
            cilindro1.position.z += 70;
            cilindro1.rotateZ(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Cilindro deitado na parede da esquerda (Mais interno)
            var material2 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material2.map = this.texture2;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.CylinderGeometry(3, 3, 25, 64, 64);
            var cilindro2 = new THREE.Mesh(geometry2, material2);
            cilindro2.material.transparent = true;
            this.objectsTextured.push(cilindro2);
            cilindro2.position.x += sizeCube / 2 + 5;
            cilindro2.position.z += 70;
            cilindro2.rotateZ(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro2);

            //Paralelepípedo que fica em cima da parede direita.
            var material3 = new THREE.MeshPhongMaterial();
            material3.map = this.texture9;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry3, material3);
            placa1.material.transparent = true;
            this.objectsTextured.push(placa1);
            placa1.position.z += sizeCube / 2;
            placa1.position.y += 30;
            placa1.position.x += sizeCube / 2 - 20;
            this.rightCube.add(placa1);

            //Cilindro que fica em cima da parede esquerda.
            var material4 = new THREE.MeshPhongMaterial();
            material4.map = this.map3;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.8, 0.8);
            var geometry4 = new THREE.CylinderGeometry(30, 30, 30);
            var cilindro3 = new THREE.Mesh(geometry4, material4);
            cilindro3.material.transparent = true;
            this.objectsTextured.push(cilindro3);
            cilindro3.position.z += sizeCube / 2 + 15;
            cilindro3.position.y += 10;
            cilindro3.position.x -= 35;
            cilindro3.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro3);


        } else if (this.texturasVar == 6) {

            //Cubo que fica em cima do plano.
            var material4 = new THREE.MeshPhongMaterial({ color: "#474849" });
            material4.map = this.texture1;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.9, 0.9);
            var geometry3 = new THREE.BoxGeometry(20, 20, 7);
            var cubo1 = new THREE.Mesh(geometry3, material4);
            cubo1.material.transparent = true;
            this.objectsTextured.push(cubo1);
            // cubo1.position.z += 3;
            cubo1.position.x = -10;
            cubo1.position.y = -heightPlan / 2 + 30;
            this.plane.add(cubo1);

            //Coluna cilindrica vertical da esquerda
            var material1 = new THREE.MeshPhongMaterial();
            material1.map = this.texture1;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.9, 0.9);
            var geometry = new THREE.CylinderGeometry(10, 10, sizeCube, 64, 64, undefined, undefined, Math.PI);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            cilindro1.position.x += sizeCube / 2;
            cilindro1.position.y -= 25;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Coluna cilindrica vertical da direita
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture1;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.9, 0.9);
            var cilindro2 = new THREE.Mesh(geometry, material2);
            cilindro2.material.transparent = true;
            this.objectsTextured.push(cilindro2);
            cilindro2.rotateX(THREE.MathUtils.degToRad(90));
            cilindro2.position.y -= 25;
            cilindro2.rotateY(THREE.MathUtils.degToRad(180));
            cilindro2.position.x -= sizeCube / 2;
            this.rightCube.add(cilindro2);

            //Tronco de pirâmide em cima do cubo da direita
            var material3 = new THREE.MeshPhongMaterial();
            material3.map = this.texture6;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.CylinderGeometry(26, 35, 4, 4, 1, undefined, undefined, undefined);
            var cilindro3 = new THREE.Mesh(geometry2, material3);
            cilindro3.material.transparent = true;
            this.objectsTextured.push(cilindro3);
            cilindro3.rotateX(THREE.MathUtils.degToRad(90));
            cilindro3.position.z += sizeCube / 2;
            cilindro3.rotateY(THREE.MathUtils.degToRad(45));
            this.rightCube.add(cilindro3);

            //Paralelepipedo vertical que fica em cima da parede esquerda.
            var material4 = new THREE.MeshPhongMaterial();
            material4.map = this.map10;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(60, 20, 30);
            var paralelepipedo1 = new THREE.Mesh(geometry3, material4);
            paralelepipedo1.material.transparent = true;
            this.objectsTextured.push(paralelepipedo1);
            paralelepipedo1.position.z += sizeCube / 2 + 15;
            paralelepipedo1.position.y += 10;
            paralelepipedo1.position.x -= 35;
            paralelepipedo1.rotateY(THREE.MathUtils.degToRad(90));
            this.leftCube.add(paralelepipedo1);

        } else if (this.texturasVar == 7) {
            this.addObjectsToPlan(this.texturasVar);
            //Disco em cima do cubo da esquerda
            var material1 = new THREE.MeshPhongMaterial({ color: "#737373" });
            material1.map = this.texture9;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(40, 40, 10, 64, 64);
            var cilindro1 = new THREE.Mesh(geometry, material1);
            cilindro1.material.transparent = true;
            cilindro1.opacity = 0;
            this.objectsTextured.push(cilindro1);
            cilindro1.position.z += sizeCube / 2;
            cilindro1.rotateX(THREE.MathUtils.degToRad(90));
            this.leftCube.add(cilindro1);

            //Paralelepípedo que fica em cima da parede direita.
            var material2 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material2.map = this.texture1;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry2, material2);
            placa1.material.transparent = true;
            this.objectsTextured.push(placa1);
            placa1.position.z += sizeCube / 2;
            placa1.position.y -= 45;
            placa1.position.x -= sizeCube / 2 - 30;
            this.rightCube.add(placa1);

        } else if (this.texturasVar == 8) {

            //Cubo que fica em cima do plano.
            var material3 = new THREE.MeshPhongMaterial({ color: "#474849" });
            material3.map = this.texture2;
            material3.map.magFilter = THREE.LinearFilter;
            material3.map.minFilter = THREE.LinearFilter;
            material3.map.wrapS = THREE.RepeatWrapping;
            material3.map.wrapT = THREE.RepeatWrapping;
            material3.map.repeat.set(0.5, 0.5);
            var geometry3 = new THREE.BoxGeometry(20, 20, 15);
            var cubo1 = new THREE.Mesh(geometry3, material3);
            cubo1.material.transparent = true;
            this.objectsTextured.push(cubo1);
            // cubo1.position.z += 3;
            cubo1.position.x = 7;
            cubo1.position.y = 13;
            this.plane.add(cubo1);

            //Cilindro que fica em cima do plano.
            var material2 = new THREE.MeshPhongMaterial({ color: "##222222" });
            material2.map = this.texture4;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry2 = new THREE.CylinderGeometry(10, 10, 5, 64, 64);
            var cilindro1 = new THREE.Mesh(geometry2, material2);
            cilindro1.material.transparent = true;
            this.objectsTextured.push(cilindro1);
            cilindro1.rotateX(THREE.MathUtils.degToRad(90))
            cilindro1.position.z += 2.5;
            cilindro1.position.x -= 30;
            this.plane.add(cilindro1);

            //Paralelepípedo que fica na parede direita.
            var material1 = new THREE.MeshPhongMaterial({ color: "#707070" });
            material1.map = this.texture8;
            material1.map.magFilter = THREE.LinearFilter;
            material1.map.minFilter = THREE.LinearFilter;
            material1.map.wrapS = THREE.RepeatWrapping;
            material1.map.wrapT = THREE.RepeatWrapping;
            material1.map.repeat.set(0.5, 0.5);
            var geometry1 = new THREE.BoxGeometry(3, 40, 40);
            var paralelepipedo1 = new THREE.Mesh(geometry1, material1);
            paralelepipedo1.material.transparent = true;
            this.objectsTextured.push(paralelepipedo1);
            paralelepipedo1.position.x -= sizeCube / 2 + 1.5;
            paralelepipedo1.position.z += 50;
            this.rightCube.add(paralelepipedo1);

            //Paralelepípedo que fica em cima da parede direita.
            var material4 = new THREE.MeshPhongMaterial();
            material4.map = this.map1;
            material4.map.magFilter = THREE.LinearFilter;
            material4.map.minFilter = THREE.LinearFilter;
            material4.map.wrapS = THREE.RepeatWrapping;
            material4.map.wrapT = THREE.RepeatWrapping;
            material4.map.repeat.set(0.5, 0.5);
            var geometry4 = new THREE.BoxGeometry(40, 40, 5);
            var placa1 = new THREE.Mesh(geometry4, material4);
            placa1.material.transparent = true;
            this.objectsTextured.push(placa1);
            placa1.position.z += sizeCube / 2;
            placa1.position.y -= 0;
            placa1.position.x -= sizeCube / 2 - 20;
            this.rightCube.add(placa1);

            //Cubo que fica em cima da parede esquerda.
            var material5 = new THREE.MeshPhongMaterial();
            material5.map = this.texture3;
            material5.map.magFilter = THREE.LinearFilter;
            material5.map.minFilter = THREE.LinearFilter;
            material5.map.wrapS = THREE.RepeatWrapping;
            material5.map.wrapT = THREE.RepeatWrapping;
            material5.map.repeat.set(0.5, 0.5);
            var geometry5 = new THREE.BoxGeometry(20, 20, 20);
            var placa2 = new THREE.Mesh(geometry5, material5);
            placa2.material.transparent = true;
            this.objectsTextured.push(placa2);
            placa2.position.z += sizeCube / 2 + 15;
            placa2.position.y += 10;
            placa2.position.x -= 35;
            this.leftCube.add(placa2);

            //Cubo que fica em cima da parede esquerda.
            var placa3 = new THREE.Mesh(geometry5, material5);
            placa3.material.transparent = true;
            this.objectsTextured.push(placa3);
            placa3.position.z += sizeCube / 2 + 15;
            placa3.position.y += 90;
            placa3.position.x -= 35;
            this.leftCube.add(placa3);

            //Cubo que fica em cima da parede esquerda.;
            var placa4 = new THREE.Mesh(geometry5, material5);
            placa4.material.transparent = true;
            this.objectsTextured.push(placa4);
            placa4.position.z += sizeCube / 2 + 15;
            placa4.position.y += 50;
            placa4.position.x -= 35;
            this.leftCube.add(placa4);
        }
        this.addObjectsToPlan(this.texturasVar);
        this.setObjectsOpacity(0);
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
            var loader = new GLTFLoader(this.manager);

            loader.load("./assets/turret3.glb", (gltf) => {
                var obj = gltf.scene;
                obj.visible = true;
                var obj = gltf.scene;
                obj.traverse(function (child) {
                    if (child) {
                        child.castShadow = true;
                    }
                });
                obj.traverse(function (node) {
                    if (node.material) node.material.side = THREE.DoubleSide;
                });

                var obj = this.normalizeAndRescale(obj, 25);
                this.turret = obj;
                this.turret.rotateX(THREE.MathUtils.degToRad(90));
                this.turret.rotateY(THREE.MathUtils.degToRad(90));
                this.turret.transparent = true;

                this.turret.position.set(Environment.TurretPositionsGeneration[Environment.count][0], Environment.TurretPositionsGeneration[Environment.count][1], Environment.TurretPositionsGeneration[Environment.count][2]);
                Environment.count++;

                console.log(this.turret.position);
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
    setLeftCubeOpacity(opacity) {
        this.leftCube.material.opacity = opacity;
        this.leftLine.material.opacity = opacity;
    }

    setObjectsOpacity(opacity){
        for(var i = 0; i < this.objectsTextured.length; i++){
            this.objectsTextured[i].material.opacity = opacity;
            console.log(this.objectsTextured[i].opacity);
        }
    }

    setRightCubeOpacity(opacity) {
        this.rightCube.material.opacity = opacity;
        this.rightLine.material.opacity = opacity;
    }

    setPlaneOpacity(opacity) {
        this.plane.material.opacity = opacity;
        // this.grid.material.opacity = opacity;
    }

    //Retorna o plano
    getPlane() {
        return this.plane;
    }

    getTurret() {
        return this.turret;
    }

    getGrid() {
        return this.grid;
    }

    changeVelocity(velocity) {
        this.velocity = velocity;
    }

    //Movimenta a posição do plano
    move() {
        this.plane.position.z += this.velocity;
    }

    addObjectsToPlan(idPlano) {
        // //Dodecaedro
        // var material = new THREE.MeshPhongMaterial();
        // material.map = this.texture2;
        // material.map.magFilter = THREE.LinearFilter;
        // material.map.minFilter = THREE.LinearFilter;
        // var geometry = new THREE.DodecahedronGeometry(20,20,21);
        // var dodecahed = new THREE.Mesh(geometry, material);
        // dodecahed.position.x = 60;
        // dodecahed.position.y = 30;
        // this.plane.add(dodecahed);

        if (idPlano == 1 || idPlano==2 && idPlano==3 || idPlano==4 || idPlano==5 || idPlano==6 || idPlano==7 || idPlano==8) {
            
            if(idPlano!=5){
                // Paralelepípedo
                var material = new THREE.MeshPhongMaterial();
                material.map = this.texture1;
                material.map.magFilter = THREE.LinearFilter;
                material.map.minFilter = THREE.LinearFilter;
                material.map.wrapS = THREE.RepeatWrapping;
                material.map.wrapT = THREE.RepeatWrapping;
                material.map.repeat.set(0.5, 0.5);
                var geometry = new THREE.BoxGeometry(70, 25, 30);
                var objMesh = new THREE.Mesh(geometry, material);
                objMesh.material.transparent = true;
                this.objectsTextured.push(objMesh);
                objMesh.position.z = 0;
                objMesh.position.y = 100;
                objMesh.position.x = 0;
                this.plane.add(objMesh);
            }
            

            // // Paralelepípedo
            // var material1 = new THREE.MeshPhongMaterial();
            // material1.map = this.texture5;
            // material1.map.magFilter = THREE.LinearFilter;
            // material1.map.minFilter = THREE.LinearFilter;
            // material1.map.wrapS = THREE.RepeatWrapping;
            // material1.map.wrapT = THREE.RepeatWrapping;
            // material1.map.repeat.set(0.5, 0.5);
            // var geometry = new THREE.BoxGeometry(50,10,30);
            // var objMesh = new THREE.Mesh(geometry, material1);
            // objMesh.position.z = 0;
            // objMesh.position.y = 60;
            // objMesh.position.x = -15;
            // this.plane.add(objMesh);

            //4 Cilindros do lado esquerdo
            // cilindro mais alto
            

            var material2 = new THREE.MeshPhongMaterial({color: "#454545"});
            material2.map = this.texture9;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(10, 10, 30);
            var objMesh = new THREE.Mesh(geometry, material2);
            objMesh.material.transparent = true;
            this.objectsTextured.push(objMesh);
            objMesh.position.z = 10;
            objMesh.position.y = 40;
            objMesh.position.x = -80;
            objMesh.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(objMesh);

            

            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture5;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(10, 10, 30);
            var objMesh = new THREE.Mesh(geometry, material2);
            objMesh.material.transparent = true;
            this.objectsTextured.push(objMesh);
            objMesh.position.z = -5;
            objMesh.position.y = -40;
            objMesh.position.x = -80;
            objMesh.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(objMesh);


            //4 Cilindros do lado direito
            // cilindro mais alto
            
            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture1;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(10, 10, 30);
            var objMesh = new THREE.Mesh(geometry, material2);
            objMesh.material.transparent = true;
            this.objectsTextured.push(objMesh);
            objMesh.position.z = 10;
            objMesh.position.y = -40;
            objMesh.position.x = 60;
            objMesh.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(objMesh);

            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture4;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(10, 10, 30);
            var objMesh = new THREE.Mesh(geometry, material2);
            objMesh.material.transparent = true;
            this.objectsTextured.push(objMesh);
            objMesh.position.z = 5;
            objMesh.position.y = 0;
            objMesh.position.x = 80;
            objMesh.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(objMesh);

            var material2 = new THREE.MeshPhongMaterial();
            material2.map = this.texture4;
            material2.map.magFilter = THREE.LinearFilter;
            material2.map.minFilter = THREE.LinearFilter;
            material2.map.wrapS = THREE.RepeatWrapping;
            material2.map.wrapT = THREE.RepeatWrapping;
            material2.map.repeat.set(0.5, 0.5);
            var geometry = new THREE.CylinderGeometry(10, 10, 30);
            var objMesh = new THREE.Mesh(geometry, material2);
            objMesh.material.transparent = true;
            this.objectsTextured.push(objMesh);
            objMesh.position.z = -5;
            objMesh.position.y = 40;
            objMesh.position.x = 20;
            objMesh.rotateX(THREE.MathUtils.degToRad(90));
            this.plane.add(objMesh);

            // // IcosahedronGeometry
            // var material3 = new THREE.MeshPhongMaterial();
            // material3.map = this.texture9;
            // material3.map.magFilter = THREE.LinearFilter;
            // material3.map.minFilter = THREE.LinearFilter;
            // material3.map.wrapS = THREE.RepeatWrapping;
            //     material3.map.wrapT = THREE.RepeatWrapping;
            //     material3.map.repeat.set(0.5, 0.5);
            // var geometry = new THREE.IcosahedronGeometry(10,0);
            // var objMesh = new THREE.Mesh(geometry, material3);
            // objMesh.position.z = 0;
            // objMesh.position.y = 100;
            // objMesh.position.x = 30;
            // objMesh.rotateX(THREE.MathUtils.degToRad(90));
            // this.plane.add(objMesh);
        }
    }
}