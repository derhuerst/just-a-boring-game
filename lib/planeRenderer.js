'use strict'

const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3

const createGeometry = require('gl-geometry')
const glslify = require('glslify')
const createShader = require('gl-shader')

const pick = require('camera-picking-ray')
const Ray = require('ray-3d')



let tile = {
	positions: [
		[ 0, 0, 0 ],
		[ 0, 0, 1 ],
		[ 1, 0, 1 ],
		[ 1, 0, 0 ]
	],
	cells: [
		[ 0, 1, 2 ],
		[ 0, 2, 3 ]
	]
}



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
		this.gutterGeometry.attr('position', gutterPositions(state.mapWidth, state.mapHeight))
		this.tileModels = Object.values(state.fields)
			.map(({ x, y }) => {
				let m = mat4.create()
				mat4.translate(m, this.gutterModel, [ x, 0, y ])
				return m
			})
	},

	render: function (projection, view) {
		this.gutterGeometry.bind(this.gutterShader)
		this.gutterShader.uniforms.uProjection = projection
		this.gutterShader.uniforms.uView = view
		this.gutterShader.uniforms.uModel = this.gutterModel
		this.gutterGeometry.draw(this.gl.LINES)

		this.tileGeometry.bind(this.tileShader)
		this.tileShader.uniforms.uProjection = projection
		this.tileShader.uniforms.uView = view
		this.tileShader.uniforms.uColor = this.tileColor
		for (let model of this.tileModels) {
			this.tileShader.uniforms.uModel = model
			this.tileGeometry.draw(this.gl.TRIANGLES)
		}
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
		tileColor: [ 1, 0, 0 ]
	}, options)
	p.gl = gl

	p.gutterModel = mat4.create()
	mat4.translate(p.gutterModel, p.gutterModel, [ -0.5, 0, -0.5 ])
	p.gutterGeometry = createGeometry(p.gl)
	p.gutterShader = createShader(p.gl,
		glslify('../shaders/gutter.vert'),
		glslify('../shaders/gutter.frag')
	)

	p.tileGeometry = createGeometry(p.gl)
	p.tileGeometry.attr('position', tile.positions)
	p.tileGeometry.faces(tile.cells)
	p.tileShader = createShader(p.gl,
		glslify('../shaders/tile.vert'),
		glslify('../shaders/tile.frag')
	)

	p.state({
		mapWidth: 0,
		mapHeight: 0,
		fields: { }
	})

	return p
}

module.exports = createPlaneRenderer