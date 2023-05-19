import * as THREE from  'three';
import { createGroundPlaneWired, getMaxSize } from "../libs/util/util.js";
import { Tree } from './tree.js';
import { sizeCube, velocityPlan, widthPlan } from './variables.js';
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
        
        this.leftLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, linewidth: 50} ) ); 
        this.leftCube.add( this.leftLine );

        this.rightCube = new THREE.Mesh( geometry, material);
        this.rightCube.receiveShadow = true;
        this.rightCube.position.x = widthPlan/2 + sizeCube/2;
        
        this.plane.add(this.rightCube);
        
        this.rightLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, linewidth: 50 }));
        
        this.rightCube.add( this.rightLine );

    }

    buildOneTurret() {
            var objLoader = new OBJLoader();

            objLoader.load("./turret2.obj", (obj) => {

                obj.visible = true;
                obj.traverse(function (child) {
                    child.castShadow = true;
                });

                obj.traverse(function (node) {
                    if (node.material) node.material.side = THREE.DoubleSide;
                });

                var obj = this.normalizeAndRescale(obj, 20);
                this.turret = obj;
                this.turret.rotateX(THREE.MathUtils.degToRad(90));
                this.turret.rotateY(THREE.MathUtils.degToRad(90))
                this.plane.add(this.turret);
            });

            // var esferaGeom = new THREE.SphereGeometry(5, 20, 20);
            // var material = new MeshBasicMaterial();
            // this.turret = new THREE.Mesh(esferaGeom, material);
            // this.plane.add(this.turret);
            // this.turret.position.z = 5;
            // this.turret.castShadow = true;
        
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