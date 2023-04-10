import * as THREE from  'three';
import { createGroundPlaneWired } from "../libs/util/util.js";
import { Tree } from './tree.js';

/*
Classe responsável por modelar o ambiente e seus planos retangulares com um 
número aleatório de árvores compostas.
*/
export class Environment{
    constructor(height, width){
        this.height = height;
        this.width = width;
        console.log('Construindo ambiente...');
        this.plane = createGroundPlaneWired(width, height);
        this.vetPositions = [];
        this.trees = [];
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    verificationDistance(x,y){
        let dist;
        for(var i = 0; i < this.vetPositions.length; i++){
            dist = Math.sqrt(Math.pow(x-this.vetPositions[i][0], 2) + Math.pow(y-this.vetPositions[i][1], 2));
            if(dist <= 14)
                return true;
        }
        return false;
    }

    buildPlan(){
        let numTrees = this.getRandomArbitrary(3, 6);
        let treeInstance = new Tree();
        let x, y;
        for(var i = 0; i < numTrees; i++){
            let tree = treeInstance.buildTree();
            tree.transparent = true;
            tree.rotateX(THREE.MathUtils.degToRad(90));
            x = this.getRandomArbitrary(-48, 48);
            y = this.getRandomArbitrary(-48, 48);
            while(this.verificationDistance(x, y)){
                x = this.getRandomArbitrary(-48, 48);
                y = this.getRandomArbitrary(-48, 48);
            }
            tree.position.set(x, y, 2.5);
            this.plane.add(tree);
            let element = [x, y];
            this.vetPositions.push(element);
            this.trees.push(tree);
        }
    }

    getEnvironment(){
        return this.plane;
    }

    move(){
        this.plane.position.z -= 0.8;
    }
}