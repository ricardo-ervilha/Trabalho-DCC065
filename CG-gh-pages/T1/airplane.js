import * as THREE from  'three';

export class Airplane{
    constructor(){ 
    }

    buildAirPlane(){
        const geometriaCorpo = new THREE.CylinderGeometry( 2, 1.4, 15, 50 );
        const geometriaAsa = new THREE.CylinderGeometry(1, 0.05, 10, 9, 20);
        const geometriaCabine = new THREE.SphereGeometry(1,50, 50);

        const material1 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        const material2 = new THREE.MeshBasicMaterial( {color: 0xffff00});
        const material3 = new THREE.MeshBasicMaterial( {color: 0x1e90ff});
        
        const corpo = new THREE.Mesh( geometriaCorpo, material1 );
        const asa = new THREE.Mesh( geometriaAsa, material2);
        const asa2 = new THREE.Mesh( geometriaAsa, material2);
        const cabine = new THREE.Mesh( geometriaCabine, material3);
        const ponta = new THREE.Mesh( geometriaCabine, material1);
        cabine.position.set(0,0,-1.3)
        ponta.position.set(0,-4.0,0);
        corpo.position.y += 5;
        
        asa.rotateZ(THREE.MathUtils.degToRad(90));
        asa2.rotateZ(THREE.MathUtils.degToRad(-90));
        corpo.rotateX(THREE.MathUtils.degToRad(90));
        
        corpo.add(asa);
        
        corpo.add(asa2);
        
        corpo.add(cabine);
        corpo.add(ponta);

        return corpo;
    }
}