import './style.css'

import * as THREE from 'three';

import vertex from "./vertex.js";
import fragment from "./fragment.js";

const scene = new THREE.Scene();

//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera(-1,1,1,-1, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,

	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0, -1.0,  1.0
] );

const uniforms = {
  u_time: { type: "f", value: 1.0 },
  u_resolution: { type: "v2", value: new THREE.Vector2() },
  u_mouse: { type: "v3", value: new THREE.Vector3() },
  u_sphere_pos: { type: "v3v", value:   
    [new THREE.Vector3(-1.0, 1.0, 10.0),
    new THREE.Vector3(-3.0, 0.0, 10.0),
    new THREE.Vector3(1.0, 4.0, 15.0),
    new THREE.Vector3(0.0, -3.0, 15.0),
    new THREE.Vector3(2.0, -1.0, 10.0)]
  },
};

geometry.setAttribute ('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertex,
  fragmentShader: fragment,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const clock = new THREE.Clock();

init();
animate();

function init() {
  window.addEventListener('resize', onWindowResize, false);
  addEventListener("mousemove", (event) => {});

  onmousemove = (event) => onMouseMove(event);
  onWindowResize();
}

function onMouseMove(e){
  let vector = new THREE.Vector3();
  vector.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1,0);
  //uniforms.u_mouse.value = vector.sub(new THREE.Vector3(0.0, 0.0, -4.0)).multiply(10.0);
  let test = vector.sub(new THREE.Vector3(0.0, 0.0, -4.0));
  uniforms.u_mouse.value = test.multiplyScalar(7.0);

  console.log(uniforms.u_mouse.value);
}

function onWindowResize() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

class Particle 
{
  constructor(Density, Pressure, Acceleration, Velocity, LastPos)
  {
    this.Density = Density;
    this.Pressure = Pressure;
    this.Acceleration = Acceleration;
    this.Velocity = Velocity;
    this.LastPos = LastPos;
  }
}

function get_poly6_smoothing(distance_sq, smoothing_radius)
{
  if(distance_sq > smoothing_radius * smoothing_radius)
  {
    return 0.0;
  }

  let poly6 = (smoothing_radius * smoothing_radius) - distance_sq;
  poly6 = pow(poly6, 4.0);
  poly6 = (315.0 / (64.0 * Math.PI * pow(smoothing_radius, 12.0))) * poly6;

  return poly6;
}

function get_spiky(distance_sq, smoothing_radius)
{
  let spiky = pow(smoothing_radius - sqrt(distance_sq), 2.0);
  spiky = (-45 / PI * pow(smoothing_radius, 6.0)) * spiky;

  return spiky;
}

function get_viscosity(distance_sq, smoothing_radius)
{
  return (45.0 / (PI * pow(smoothing_radius, 6.0))) * (smoothing_radius - sqrt(distance_sq));
}

function integrate()
{

}