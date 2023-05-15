// Importando as bibliotecas necessárias
import * as THREE from 'three';

// Inicializando a cena, a câmera e o renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Criando o cubo
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Criando a geometria e o material dos cilindros
const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Função para disparar os cilindros
function shootCylinder() {
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.copy(cube.position);
  cylinder.position.y -= 0.5; // Ajuste para que o cilindro fique no chão
  scene.add(cylinder);

  const targetPosition = new THREE.Vector3(0, -5, 0); // Posição alvo no chão
  const tween = new TWEEN.Tween(cylinder.position)
    .to(targetPosition, 2000) // Duração do movimento do cilindro
    .onComplete(() => {
      scene.remove(cylinder);
    })
    .start();
}

// Função de animação
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

// Dispara um cilindro a cada 2 segundos
setInterval(shootCylinder, 2000);

// Configuração da câmera
camera.position.z = 5;

// Inicia a animação
animate();