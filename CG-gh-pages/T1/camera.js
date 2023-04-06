import * as THREE from 'three';

/*
Responsável por controlar a posição da câmera e seu movimento, sempre para frente. 
É necessário implementar a movimentação da câmera em relação ao avião e aos planos retangulares do ambiente.
*/

export class Camera {
    constructor() {
        console.log("Construindo camera...")
    }

    buildCamera() {

        // Main camera
        let fov = 40;
        let w = window.innerWidth;
        let h = window.innerHeight
        let aspect = w / h;
        let near = 0.1;
        let far = 1000;
        let position = new THREE.Vector3(0, 100, -100);
        let lookat = new THREE.Vector3(0, 0, 0);
        let up = new THREE.Vector3(0, 1, 0);

        // Create perspective camera
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // fov, aspect, near, far

        // Set perspective camera as default, and sets its position and lookat

        this.camera.position.copy(position);
        this.camera.up.copy(up);
        this.camera.lookAt(lookat); // or camera.lookAt(0, 0, 0);

    
        return this.camera;
    }

    movimentar(camPos){

        //decrementar o camera.position em z a uma certa taxa
        this.camera.position.copy(camPos);


        //fixar o lookAt no avião???

        this.camera.lookAt = camLook;

    }

}