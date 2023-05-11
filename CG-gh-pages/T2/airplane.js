import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';

export class Airplane{

    constructor(){
        
    }

    //Função que cria, instancia e retorna o avião.
    async buildAirPlane() {
        //Instancio o loader
        var loader = new GLTFLoader();
        let obj;
        //Carrego o arquivo glb nele
        await loader.load('./airplane.glb', (gltf) => {
            console.log(obj);
            obj = gltf.scene;
            obj.visible = true;
            obj.traverse(function (child) {
                if (child) {
                    child.castShadow = true;
                }
            });
            obj.traverse(function (node) {
                if (node.material) node.material.side = THREE.DoubleSide;
            });

        });
        console.log(obj);
        
        return obj;
    }

    normalizeAndRescale(obj, newScale) {
        var scale = getMaxSize(obj);
        obj.scale.set(newScale * (1.0 / scale),
            newScale * (1.0 / scale),
            newScale * (1.0 / scale));
        return obj;
    }

    // fixPosition(obj) {
    //     // Fix position of the object over the ground plane
    //     var box = new THREE.Box3().setFromObject(obj);
    //     if (box.min.y > 0)
    //         obj.translateY(-box.min.y);
    //     else
    //         obj.translateY(-1 * box.min.y);
    //     return obj;
    // }
}