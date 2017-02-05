precision mediump float;

attribute vec3 position;

varying vec3 color;

uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uView;
uniform vec3 uColor;

void main() {
	color = uColor;
	gl_Position = uProjection * uView * uModel * vec4(position, 1.0);
}
