import * as THREE from  'three';
import { createGroundPlaneWired } from "../libs/util/util.js";
import { Tree } from './tree.js';

export class Environment{
    constructor(height, width){
        this.plane = createGroundPlaneWired(width, height);
        this.vetPositions = [];
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    verificationDistance(x,y){
        let dist;
        for(var i = 0; i < this.vetPositions.length; i++){
            dist = Math.sqrt(Math.pow(x-this.vetPositions[i][0], 2) + Math.pow(y-this.vetPositions[i][1], 2));
            console.log(`Valor de dist: ${dist}`);
            if(dist <= 12)
                return true;
        }
        return false;
    }

    buildPlan(){
        let treeInstance = new Tree();
        let x, y;
        for(var i = 0; i < 15; i++){
            let tree = treeInstance.buildTree();
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
            console.log(this.vetPositions);
        }

        return this.plane;
    }
}