import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { airPlaneHeight, scale, invisiblePlanePosition} from './variables.js';
import {getMaxSize} from "./util.js";
import { AxesHelper, MathUtils, Scene } from '../build/three.module.js';
export class Airplane {
  
  constructor() {
    this.airplane = null;
    this.originalRotation = null;
    this.target = null;
  }

  getAirplane(){
    return this.airplane;
  }

  getOriginalRotation(){
    return this.originalRotation;
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
        
        obj.rotateY(MathUtils.degToRad(-90));
        this.originalRotation = obj.rotation.clone();
        this.airplane = obj;
        
        this.airplane.add(new THREE.AxesHelper( 12 ));
                
        this.buildTarget(scene);
        
        scene.add(obj);

    },this.onProgress, this.onError);
  }

  buildTarget(scene){
    const geometry = new THREE.BufferGeometry();
    //   const vertices = new Float32Array( [
    //   0, -2.0,  -2.0, 
    //   0, -2.0,  2.0, 

    //   .0, 2.0,  -2.0, 
    //   0,  2.0,  2.0, 

    //   0, -2.0,  -2.0,
    //   0,  2.0,  -2.0, 

    //   0, -2.0,  2.0, 
    //   0,  2.0,  2.0,
    // ] );

    const vertices = new Float32Array( [
    -1.0, -1.0,  0,
    1.0, -1.0,  0, 

    -1.0, 1.0,  0, 
    1.0,  1.0,  0, 

    -1.0, -1.0,  0, 
    -1.0,  1.0,  0,

    1.0, -1.0,  0, 
    1.0,  1.0,  0
    ] );

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    const material = new THREE.LineBasicMaterial( { color: 0x008800 } );
    this.target = new THREE.LineSegments( geometry, material );
    this.target.position.z = invisiblePlanePosition.z;
  
    scene.add(this.target)
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
