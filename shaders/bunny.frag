precision mediump float;

// Sets the color of the current fragment (pixel)
// to display the normal at the current position.
// Using `abs()` to prevent negative values, which
// would just end up being black.

varying vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
