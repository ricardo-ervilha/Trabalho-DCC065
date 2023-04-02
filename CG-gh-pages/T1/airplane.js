import * as THREE from  'three';

export class Airplane{

    constructor(){
        
    }

    //Função que constroi um avião, e devolve o avião com as coordenadas na origem.
    buildAirPlane(){
        //Corpo do avião é um cilindro
        const bodyGeometry = new THREE.CylinderGeometry(1.6, 0.4, 13, 64);
        
        //Asas do avião são uma elipse
        const wingsGeometry = new THREE.SphereGeometry(1, 32, 16);
        wingsGeometry.scale(7,1,0.5);

        //Cabine do avião é uma semi-esfera
        const cabinGeometry = new THREE.SphereGeometry(2, 64, 32, 0, 6.283185307179586, 0, 1.15);
        cabinGeometry.scale(1.0,1,0.45);

        //Cauda vertical é uma elipse
        const verticalTailGeometry = new THREE.SphereGeometry(1, 32, 16);
        verticalTailGeometry.scale(0.6, 0.25, 0.25);

        //Caudas horizontais são uma elipse
        const horizontalTailGeometry = new THREE.SphereGeometry(1, 32, 16);
        horizontalTailGeometry.scale(2, 0.25, 0.25);

        //Pino da hélice frontal
        const pinGeometry = new THREE.CylinderGeometry(0.5,0.5,1.5,64);

        //Pás da hélice frontal
        const shovelGeometry = new THREE.SphereGeometry(1, 32, 16);
        shovelGeometry.scale(1,0.25,0.25);

        //Semi-esfera da ponta do avião
        const nozzleGeometry = new THREE.SphereGeometry(0.5, 32, 16, 0, 6.283185307179586, 0, 1.15);

        //Materiais
        const bodyMaterial = new THREE.MeshBasicMaterial( {color: 0x565656} );
        const wingsMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00});
        const cabinMaterial = new THREE.MeshBasicMaterial( {color: 0xcdcdcd});
        const tailsMaterial = new THREE.MeshBasicMaterial( {color: 0xdcdcdc});
        const pinMaterial = new THREE.MeshBasicMaterial( {color: 0x7d7a7a});
        const nozzleMaterial = new THREE.MeshBasicMaterial( {color: 0xFF0000});

        //Criação dos objetos
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotateX(THREE.MathUtils.degToRad(90));

        const wings = new THREE.Mesh(wingsGeometry, wingsMaterial);
        wings.position.set(body.position.x, body.position.y+3, body.position.z);
        body.add(wings);

        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.rotateX(THREE.MathUtils.degToRad(-90));
        cabin.rotateY(THREE.MathUtils.degToRad(90));
        cabin.position.set(body.position.x, body.position.y+2, body.position.z);
        body.add(cabin);

        const verticalTail = new THREE.Mesh(verticalTailGeometry, tailsMaterial);
        verticalTail.rotateY(THREE.MathUtils.degToRad(90));
        verticalTail.position.set(body.position.x, body.position.y-5.5, body.position.z-1)
        body.add(verticalTail);

        const horizontalTails = new THREE.Mesh(horizontalTailGeometry, tailsMaterial);
        horizontalTails.position.set(body.position.x, body.position.y-5.5, body.position.z);
        body.add(horizontalTails);
        
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.set(body.position.x, body.position.y+6.5, body.position.z);

        const shovelA = new THREE.Mesh(shovelGeometry, wingsMaterial);
        shovelA.position.set(pin.position.x+1, body.position.y+0.75, body.position.z)
        const shovelB = new THREE.Mesh(shovelGeometry, wingsMaterial);
        shovelB.position.set(body.position.x-1, body.position.y+0.75, body.position.z)
        const shovelC = new THREE.Mesh(shovelGeometry, wingsMaterial);
        shovelC.rotateY(THREE.MathUtils.degToRad(90));
        shovelC.position.set(body.position.x, body.position.y+0.75, body.position.z+1)
        const shovelD = new THREE.Mesh(shovelGeometry, wingsMaterial);
        shovelD.rotateY(THREE.MathUtils.degToRad(90));
        shovelD.position.set(body.position.x, body.position.y+0.75, body.position.z-1);
        
        const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        nozzle.position.set(body.position.x, body.position.y+0.75, body.position.z);

        pin.add(shovelA);
        pin.add(shovelB);
        pin.add(shovelC);
        pin.add(shovelD);
        pin.add(nozzle);
        
        body.add(pin);

        return body;
    }
}