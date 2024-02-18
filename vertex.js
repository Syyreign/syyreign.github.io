const vertex = /* glsl */`

#ifdef GL_ES
  precision highp float;
#endif

varying vec3 vPosition;

void main() {
  vPosition = position;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}

`;
export default vertex;