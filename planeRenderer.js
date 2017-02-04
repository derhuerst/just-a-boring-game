'use strict'

const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3

const createGeometry = require('gl-geometry')
const glslify = require('glslify')
const createShader = require('gl-shader')

const pick = require('camera-picking-ray')
const Ray = require('ray-3d')



let gutterPositions = (nx, ny) => {
	let gutter = []
	for (let i = 0; i <= nx; i++) {
		gutter.push([ i, 0, 0 ], [ i, 0, ny ])
		gutter.push([ 0, 0, i ], [ ny, 0, i ])
	}
	return gutter
}



const planeRendererProto = {
	state: function (state) {
		this.geometry.attr('position', gutterPositions(state.mapWidth, state.mapHeight))
	},

	render: function (projection, view) {
		this.geometry.bind(this.shader)

		this.shader.uniforms.uProjection = projection
		this.shader.uniforms.uView = view
		this.shader.uniforms.uModel = this.model
		this.shader.uniforms.uColor = [ 0, 0, 0 ]

		this.geometry.draw(this.gl.LINES)
	},

	hit: function (mouse, width, height, view, projection) {
		let invProjView = mat4.create()
		mat4.multiply(invProjView, projection, view)
		mat4.invert(invProjView, invProjView)

		let r = {
			origin: vec3.create(),
			direction: vec3.create()
		}
		pick(r.origin, r.direction, mouse, [ 0, 0, width, height ], invProjView)
		let ray = new Ray(r.origin, r.direction)
		let collision = ray.intersectsPlane([ 0, 1, 0 ], 0)
		if (!collision) return null
		return {
			x: Math.round(collision[0]),
			y: Math.round(collision[2])
		}
	}
}



const createPlaneRenderer = (gl, options = {}) => {
	let p = Object.create(planeRendererProto)

	Object.assign(p, {
		/* default options */
	}, options)

	p.gl = gl

	p.model = mat4.create()
	mat4.translate(p.model, p.model, [ -0.5, 0, -0.5 ])
	
	p.geometry = createGeometry(p.gl)

	p.shader = createShader(p.gl,
		glslify('./shaders/plane.vert'),
		glslify('./shaders/plane.frag')
	)

	p.state({
		mapWidth: 0,
		mapHeight: 0
	})

	return p
}

module.exports = createPlaneRenderer