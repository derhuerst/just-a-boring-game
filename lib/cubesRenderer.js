'use strict'

const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3
const ndarray = require('ndarray')

const cubeComplex = require('primitive-cube')()
const createGeometry = require('gl-geometry')
const glslify = require('glslify')
const createShader = require('gl-shader')

const pick = require('camera-picking-ray')
const Ray = require('ray-3d')



const cubeRendererProto = {
	state: function (state) {
		let baseModel = mat4.create()
		mat4.translate(baseModel, baseModel, [ 0, 0.5, 0 ])

		this.models = Object.values(state.units)
			.map(({ x, y }) => {
				let m = mat4.create()
				mat4.translate(m, baseModel, [ x, 0, y ])
				return {
					model: m,
					x: x,
					y: y
				}
			})
	},

	render: function (projection, view) {
		this.geometry.bind(this.shader)

		this.shader.uniforms.uProjection = projection
		this.shader.uniforms.uView = view

		for (let m of this.models) {
			this.shader.uniforms.uModel = m.model
			this.shader.uniforms.uColor = [ 0, 0, 0 ]
			this.geometry.draw(this.gl.TRIANGLES)
		}
	},

	hit: function (mouse, width, height, view, projection) {
		let invProjView = mat4.create()
		mat4.multiply(invProjView, projection, view)
		mat4.invert(invProjView, invProjView)

		for (let m of this.models) {
			let model = m.model
			let invModel = mat4.create()
			let invProjViewModel = mat4.create()
			mat4.invert(invModel, model)
			mat4.multiply(invProjViewModel, invModel, invProjView)

			let r = {
				origin: vec3.create(),
				direction: vec3.create()
			}
			pick(r.origin, r.direction, mouse, [ 0, 0, width, height ], invProjViewModel)
			let ray = new Ray(r.origin, r.direction)

			if (cubeComplex.cells.some((cell) =>
				!!ray.intersectsTriangleCell(cell, cubeComplex.positions)))
			{
				return { x: m.x, y: m.y }
			}
		}

		return null
	}
}


const createCubeRenderer = (gl, options = {}) => {
	let c = Object.create(cubeRendererProto)

	c.gl = gl
	Object.assign(c, {
		/* default options */
	}, options)

	c.geometry = createGeometry(c.gl)
	c.geometry.attr('position', cubeComplex.positions)
	c.geometry.attr('normal', cubeComplex.normals)
	c.geometry.faces(cubeComplex.cells)

	c.shader = createShader(c.gl,
		glslify('../shaders/cubes.vert'),
		glslify('../shaders/cubes.frag')
	)

	c.state({
		units: { },
		mapWidth: 0,
		mapHeight: 0
	})

	return c
}

module.exports = createCubeRenderer