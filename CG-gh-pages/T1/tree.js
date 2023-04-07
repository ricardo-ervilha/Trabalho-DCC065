import * as THREE from  'three';

export class Tree{
    constructor(){

    }

    buildTree(){
        const foundationGeometry = new THREE.CylinderGeometry(3,3,5, 64);
        const topGeometry = new THREE.ConeGeometry( 6, 6, 32 );

        const foundationMaterial = new THREE.MeshBasicMaterial({color: 0x8b4513});
        const topMaterial = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff});

        const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        foundation.position.y += 2.5;
        const topLow = new THREE.Mesh(topGeometry, topMaterial);
        topLow.position.set(foundation.position.x, foundation.position.y+2.5, foundation.position.z);

        const topMedium = new THREE.Mesh(topGeometry, topMaterial);
        topMedium.position.set(foundation.position.x, topLow.position.y+2.5, foundation.position.z);

        const topHigh = new THREE.Mesh(topGeometry, topMaterial);
        topHigh.position.set(foundation.position.x, topMedium.position.y+2.5, foundation.position.z);


        foundation.add(topLow);
        foundation.add(topMedium);
        foundation.add(topHigh);
        return foundation;
    }
}