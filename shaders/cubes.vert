// Our vertex shader is run once for each of these
// vectors, to determine the final position of the vertex
// on the screen and pass data off to the fragment shader.

precision mediump float;

// Our attributes, i.e. the arrays of vectors in the bunny mesh.
attribute vec3 position;

// This is passed from here to be used in `bunny.frag`.
varying vec3 color;

uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uView;
uniform vec3 uColor;

void main() {
	color = uColor;
	gl_Position = uProjection * uView * uModel * vec4(position, 1.0);
}
