import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { airPlaneHeight, scale, invisiblePlanePosition, redColors } from "./variables.js";
import { getMaxSize } from "./util.js";
import { AxesHelper, MathUtils, Scene } from "../build/three.module.js";
export class Airplane {
  constructor() {
    this.airplane = null;
    this.originalRotation = null;
    this.target = null;
    this.indexCurrentColor = -1;
  }

  getAirplane() {
    return this.airplane;
  }

  getOriginalRotation() {
    return this.originalRotation;
  }

  buildAirPlane(scene) {
    var loader = new GLTFLoader();
    loader.load(
      "./assets/xwing.glb",
      (gltf) => {
        var obj = gltf.scene;
        obj.traverse(function (child) {
          if (child) {
            child.castShadow = true;
          }
        });
        obj.traverse(function (node) {
          if (node.material) node.material.side = THREE.DoubleSide;
        });

        obj = this.normalizeAndRescale(obj, scale);
        //obj = this.fixPosition(obj);

        obj.rotateY(MathUtils.degToRad(-180));
        this.originalRotation = obj.rotation.clone();
        this.airplane = obj;
        //this.airplane.rotateZ(THREE.MathUtils.degToRad(-45));

         this.airplane.add(new THREE.AxesHelper(12));

        this.buildTarget(scene);

        scene.add(obj);
        obj.translateY(20);
        this.airplane.bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
      },
      this.onProgress,
      this.onError
    );
  }

  buildTarget(scene) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      //linha superior esquerda
      -2.0, 2.0, 0, 
      -1.0, 2.0, 0,

      //linha superior direita
      1.0, 2.0, 0, 
      2.0, 2.0, 0,

      //linha inferior esquerda
      -2.0, -2.0, 0, 
      -1.0, -2.0, 0,

      //linha inferior direita
      1.0, -2.0, 0, 
      2.0, -2.0, 0,

      // linha lateral superior esquerda
      -2.0, 2.0, 0, 
      -2.0, 1.0, 0,

      // linha lateral inferior esquerda
      -2.0, -2.0, 0, 
      -2.0, -1.0, 0,

      // linha lateral superior direita
      2.0, 2.0, 0, 
      2.0, 1.0, 0,

      // linha lateral inferior direita
      2.0, -2.0, 0, 
      2.0, -1.0, 0,
    ]);

    const geometryCircle = new THREE.CircleGeometry(0.25, 32);
    const materialCircle = new THREE.MeshBasicMaterial({ color: 'red' });
    const circle = new THREE.Mesh(geometryCircle, materialCircle);
    

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({
      color: "black",
      linewidth: 2,
    });
    this.target = new THREE.LineSegments(geometry, material);

    this.target.position.z = invisiblePlanePosition.z;
    this.target.add(circle)

    scene.add(this.target);
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

  airplaneHit(){
    this.indexCurrentColor++;
    // console.log(this.indexCurrentColor);
    if(this.indexCurrentColor < 5){
      // console.log("INDEX COR ATUAL: "+this.indexCurrentColor);
      // console.log("COR ATUAL: "+redColors[this.indexCurrentColor]);
      this.airplane.traverse((child) => {
        if (child && child.isMesh) {
          child.material.color.set(redColors[this.indexCurrentColor]);

          // if(this.indexCurrentColor==0)  child.material.color.set("#ffbaba");
          // if(this.indexCurrentColor==1)  child.material.color.set("#ff7b7b");
          // if(this.indexCurrentColor==2)  child.material.color.set("#ff5252");
          // if(this.indexCurrentColor==3)  child.material.color.set("#ff0000");
          // if(this.indexCurrentColor==4)  child.material.color.set("#a70000");
          // if(this.indexCurrentColor==4)  child.material.color.set(redColors[this.indexCurrentColor]);
        }
      });
    }
  }
}
