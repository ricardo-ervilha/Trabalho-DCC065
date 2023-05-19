import * as THREE from  'three';
import { createGroundPlaneWired, getMaxSize } from "../libs/util/util.js";
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

    constructor(height, width){
        this.turret = null;
        this.trees = [];

        this.height = height;
        this.width = width;

        console.log('Construindo ambiente...');
        
        let obj = createGroundPlaneWired(width, height, 10, 10, 3, "rgb(18, 80, 112)", "rgb(204, 204, 204)");
        
        //Desempacoto obj e pego o plano, setando a opacidade para 0
        this.plane = obj.plane;
        this.plane.material.transparent = true;
        this.plane.material.opacity = 0;

        //Desempacoto obj e pego o grid, setando a opacidade para 0
        this.grid = obj.grid;
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0;

        this.leftCube = null;
        this.rightCube = null;
        this.leftLine = null;
        this.rightLine = null;
        // this.buildOneTurret();
        this.conectCubesPlane();
        this.buildOneTurret();
        this.buildTrees();
    }

    conectCubesPlane(){
        //Usar isso para criar os cubos com arestas.
        var geometry = new THREE.BoxGeometry( sizeCube, sizeCube, sizeCube ); 
        var material = new THREE.MeshPhongMaterial( {color: 0x125070, transparent: true} ); 
        
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
        
        this.rightCube.add( this.rightLine );

    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    verificationDistance(x,y){
        let dist;
        for(var i = 0; i < this.trees.length; i++){
            dist = Math.sqrt(Math.pow(x-this.trees[i].position[0], 2) + Math.pow(y-this.trees[i].position[1], 2));
            if(dist <= 14)
                return true;
        }
        return false;
    }

    buildTrees(){
        let x, y;
        for(var i = 0; i < 5; i++){
            let treeInstance =  new Tree();
            let tree = treeInstance.getFoundation();
            tree.rotateX(THREE.MathUtils.degToRad(90));
            x = this.getRandomArbitrary(-widthPlan/2 + 20, widthPlan/2 -20);
            y = this.getRandomArbitrary(-heightPlan/2 + 20, heightPlan/2 - 20);
            while(this.verificationDistance(x, y)){
                x = this.getRandomArbitrary(-widthPlan/2 + 20, widthPlan/2 - 20);
                y = this.getRandomArbitrary(-heightPlan/2 + 20, heightPlan/2 - 20);
            }
            tree.position.set(x, y, 2.5);
            this.plane.add(tree);
            let obj = {
                treeObj: treeInstance,
                position: [x,y]
            }
            this.trees.push(obj);
        }
    }

    buildOneTurret() {
            var objLoader = new OBJLoader();

            objLoader.load("./turret2.obj", (obj) => {

                obj.visible = true;
                obj.traverse(function (child) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                });

                obj.traverse(function (node) {
                    if (node.material) node.material.side = THREE.DoubleSide;
                });

                var obj = this.normalizeAndRescale(obj, 20);
                this.turret = obj;
                this.turret.rotateX(THREE.MathUtils.degToRad(90));
                this.turret.rotateY(THREE.MathUtils.degToRad(90));
                this.turret.transparent = true;
                this.plane.add(this.turret);
            });

            // var esferaGeom = new THREE.SphereGeometry(5, 20, 20);
            // var material = new MeshBasicMaterial();
            // this.turret = new THREE.Mesh(esferaGeom, material);
            // this.plane.add(this.turret);
            // this.turret.position.z = 5;
            // this.turret.castShadow = true;
        
    }

    setOpacityTrees(val){
        this.trees.forEach(element => {
            element.treeObj.setOpacity(val);
        });
    }

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
        this.grid.material.opacity = opacity;
    }

    //Retorna o plano
    getPlane(){
        return this.plane;
    }

    getTurrets(){
        return this.turret;
    }

    getGrid(){
        return this.grid;
    }

    //Movimenta a posição do plano
    move(){
        this.plane.position.z += velocityPlan;
    }
}