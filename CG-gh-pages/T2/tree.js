import * as THREE from  'three';
import {
    initRenderer,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    onWindowResize,
} from "../libs/util/util.js";

export class Tree{
    constructor(){
        this.foundation;
        this.foundation;
        this.topLow;
        this.topMedium;
        this.topHigh;

        this.buildTree();
    }

    buildTree(){
        const foundationGeometry = new THREE.CylinderGeometry(3,3,5, 64);
        const topGeometry = new THREE.ConeGeometry( 6, 6, 32 );

        //{color: 0x8b4513, transparent: true, opacity: 0}
        //{color: Math.random() * 0xffffff, transparent: true, opacity: 0}
        //Math.random() * 0xffffff
        const foundationMaterial = setDefaultMaterial(0x8b4513);
        const topMaterial = setDefaultMaterial(0x056105);
        
        foundationMaterial.transparent = true;
        foundationMaterial.opacity = 1.0;

        topMaterial.transparent = true;
        topMaterial.opacity = true;

        this.foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        this.foundation.castShadow = true;
        this.foundation.position.y += 2.5;
        this.topLow = new THREE.Mesh(topGeometry, topMaterial);
        this.topLow.castShadow = true;
        this.topLow.position.set(this.foundation.position.x, this.foundation.position.y+2.5, this.foundation.position.z);

        this.topMedium = new THREE.Mesh(topGeometry, topMaterial);
        this.topMedium.castShadow = true;
        this.topMedium.position.set(this.foundation.position.x, this.topLow.position.y+2.5, this.foundation.position.z);

        this.topHigh = new THREE.Mesh(topGeometry, topMaterial);
        this.topHigh.castShadow = true;
        this.topHigh.position.set(this.foundation.position.x, this.topMedium.position.y+2.5, this.foundation.position.z);


        this.foundation.add(this.topLow);
        this.foundation.add(this.topMedium);
        this.foundation.add(this.topHigh);
    }

    getFoundation(){
        return this.foundation;
    }

    setOpacity(val){
        this.foundation.material.opacity = val;
        this.topLow.material.opacity = val;
        this.topMedium.material.opacity = val;
        this.topHigh.material.opacity = val;
    }
}