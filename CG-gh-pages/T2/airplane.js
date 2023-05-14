import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { airPlaneHeight, scale} from './variables.js';
import {getMaxSize} from "../libs/util/util.js";
import { AxesHelper, MathUtils } from '../build/three.module.js';
export class Airplane {
  
  constructor() {
    this.airplane = null;
  }

  getAirplane(){
    return this.airplane;
  }

  buildAirPlane(scene) {
    var loader = new GLTFLoader( );
    loader.load( 'airplane.glb', ( gltf ) => {
        var obj = gltf.scene;
        obj.traverse( function ( child ) {
        if ( child ) {
            child.castShadow = true;
        }
        });
        obj.traverse( function( node )
        {
        if( node.material ) node.material.side = THREE.DoubleSide;
        });

        obj = this.normalizeAndRescale(obj, scale);
        //obj = this.fixPosition(obj);
        obj.position.y = airPlaneHeight;
        obj.rotateY(MathUtils.degToRad(-90));
        this.airplane = obj;
        this.airplane.add(new THREE.AxesHelper( 12 ));
        scene.add(obj);

    },this.onProgress, this.onError);
  }

  onError() {}

  onProgress() {}

  normalizeAndRescale(obj, newScale) {
    //Normaliza o objeto e multiplica por uma nova escala
    var scale = getMaxSize(obj);
    obj.scale.set(
      newScale * (1.0 / scale),
      newScale * (1.0 / scale),
      newScale * (1.0 / scale)
    );
    return obj;
  }

  fixPosition(obj) {
    // Corrige a posição do objeto acima do plano
    var box = new THREE.Box3().setFromObject(obj);
    if (box.min.y > 0) obj.translateY(-box.min.y);
    else obj.translateY(-1 * box.min.y);
    return obj;
  }
}
