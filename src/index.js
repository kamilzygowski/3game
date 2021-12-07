import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
/**
 * GUI Controls
 */
import * as dat from 'dat.gui'

const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  5000
)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
// controls.enableZoom = false
controls.enablePan = false
controls.dampingFactor = 0.05
controls.maxDistance = 1000
controls.minDistance = 30
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
}
//let wscontrols = {};
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Grid and grid helper
 */
/*const gridHelper = new THREE.GridHelper(2000,20);
scene.add(gridHelper);*/

/**
 * Draw ground
 */
const groundShape = new THREE.BoxGeometry(1,1,1);
const groundMap = new THREE.TextureLoader().load('https://i.postimg.cc/ZKr4dWxm/kamien.png');
const groundMaterial = new THREE.MeshBasicMaterial({map:groundMap});
const ground = new THREE.Mesh(groundShape,groundMaterial);
scene.add(ground);

let groundSQM = {};

function groundMaker(size,x,z){
  for (let i=0; i<size; i++){
    
    groundSQM['g' + i] = ground.clone();
    groundSQM['g' + i].scale.set(100, 1,100);
    groundSQM['g' + i].position.set(x * 100,0, z * i * 100);
    scene.add(groundSQM['g' + i]);
  }
}

function groundDraw(sizeX, sizeZ){
  for (let i =0; i < sizeX*sizeZ; i++){
    groundMaker(50,sizeX-i,sizeZ);
    groundMaker(50,-sizeX+i,sizeZ);
    groundMaker(50,sizeX-i,-sizeZ);
    groundMaker(50,-sizeX+i,-sizeZ);
    groundMaker(50,0,-sizeZ);
    groundMaker(50,0,sizeZ);
  }
}

// Parameter describes the number of SQMS in map rendering, drawning ground func is ready to use
// Number of sizeX means the numbers of left-right sqms, chasnging size in groundMaker func changes the north-south sqms
groundDraw(100,1);

/**
 * Draw Player
 */
const playerShape = new THREE.BoxGeometry(1,1,1);
//const playerMap;
const playerMaterial = new THREE.MeshBasicMaterial({color:'red'});
const player = new THREE.Mesh(playerShape, playerMaterial);
//scene.add(player);
player.position.x = 0;
player.position.y = 50;
player.position.z = 0;
player.scale.set(10,100,10);
player.height =50 ;
player.speed = 2.9;
player.jumpHeight = 2.7;
player.turnSpeed = .1;
player.velocity = 0;
player.gravity = .05 ;
player.jumps = false;

/**
 * Camera posisitons set are here because of player values initialization
 */
camera.position.x = 1
camera.position.y = player.height
camera.position.z = 50
scene.add(camera);

/**
 * Background texture
 */
const backgroundTexture = new THREE.TextureLoader().load('https://i.postimg.cc/nr3DqRGN/pexels-abdullah-ghatasheh-1631677.jpg');
scene.background = backgroundTexture;

/**
 *
 * Controls listeners
 */
 document.addEventListener('keydown', ({ keyCode }) => { controls[keyCode] = true });
 document.addEventListener('keyup', ({ keyCode }) => { controls[keyCode] = false });

function control() {
  // Controls:Engine 
  if(controls[87]){ // w
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  if(controls[83]){ // s
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  if(controls[65]){ // a
    camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
  }
  if(controls[68]){ // d
    camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
  }
  if(controls[37]){ // la
    camera.rotation.y -= player.turnSpeed;
  }
  if(controls[39]){ // ra
    camera.rotation.y += player.turnSpeed;
  }
  if(controls[32]) { // space
    if(player.jumps) return false;
    player.jumps = true;
    player.velocity = -player.jumpHeight;
  }
}
function ixMovementUpdate() {
  player.velocity += player.gravity;
  camera.position.y -= player.velocity;
  
  if(camera.position.y < player.height) {
    camera.position.y = player.height;
    player.jumps = false;
  }
}

document.addEventListener('click', function(e){
  switch (e.keyCode) {
    case 87:
      player.position.x += 0.5;
      break;
  
    default:
      break;
  }
})

function update(){
  control();
  ixMovementUpdate();
}

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
update();
  //player.position.x += 0.3;

  //mesh.rotation.y += 0.01 * Math.sin(1)
  //mesh.rotation.y += 0.01 * Math.sin(1)
  //mesh.rotation.z += 0.01 * Math.sin(1)

  // Update controls
  //controls.update()
  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
