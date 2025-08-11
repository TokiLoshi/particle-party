uniform float uTime; 
uniform vec3 color; 
varying vec2 vUv; 
varying vec3 vPosition; 

void main() {
  float r = sin(vPosition.x * 2.0 + uTime) * 1.0 + 0.5; 
  float g = sin(vPosition.y * 2.0 + uTime * 1.5) * 0.5 + 0.5; 
  float b = sin(vPosition.z * 2.0 + uTime * 2.0) * 0.5 + 0.5;

  vec3 animatedColor = vec3(r, g, b) * color; 
  gl_FragColor = vec4(animatedColor, 1.0); 
}