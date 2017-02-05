precision mediump float;

attribute vec3 position;

uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uView;

void main() {
	gl_Position = uProjection * uView * uModel * vec4(position, 1.0);
}
