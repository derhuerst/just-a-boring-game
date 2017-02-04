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
		this.nx = state.mapWidth
		this.ny = state.mapHeight
		this.cubes = ndarray(state.map, [ this.nx, this.ny ])

		let baseModel = mat4.create()
		mat4.translate(baseModel, baseModel, [ 0, 0.5, 0 ])

		this.models = new Array(this.nx).fill(null).map(() => new Array(this.ny))

		for (let i = 0; i < this.nx; i++) {
			for (let j = 0; j < this.ny; j++) {
				if (this.cubes.get(i, j)) {
					let newModel = mat4.create()
					mat4.translate(newModel, baseModel, [ i, 0, j ])
					this.models[i][j] = newModel
				}
			}
		}
	},

	render: function (projection, view) {
		this.geometry.bind(this.shader)

		this.shader.uniforms.uProjection = projection
		this.shader.uniforms.uView = view

		for (let i = 0; i < this.nx; i++) {
			for (let j = 0; j < this.ny; j++) {
				if (this.cubes.get(i, j)) {
					this.shader.uniforms.uModel = this.models[i][j]

					// if (hit.x === i && hit.y === j) {
					// 	this.shader.uniforms.uColor = [ 1, 0, 0 ]
					// } else if (ownField.x === i && ownField.y === j) {
					// 	this.shader.uniforms.uColor = [ 0, 1, 0 ]
					// } else if (peerField.x === i && peerField.y === j) {
					// 	this.shader.uniforms.uColor = [ 0, 0, 1 ]
					// } else {
						this.shader.uniforms.uColor = [ 0, 0, 0 ]
					// }
					this.geometry.draw(this.gl.TRIANGLES)
				}
			}
		}
	},

	hit: function (mouse, width, height, view, projection) {
		let invProjView = mat4.create()
		mat4.multiply(invProjView, projection, view)
		mat4.invert(invProjView, invProjView)

		for (let i = 0; i < this.nx; i++) {
			for (let j = 0; j < this.ny; j++) {
				if (this.cubes.get(i, j)) {
					let cubeModel = this.models[i][j]
					let invModel = mat4.create()
					let invProjViewModel = mat4.create()
					mat4.invert(invModel, cubeModel)
					mat4.multiply(invProjViewModel, invModel, invProjView)

					let r = {
						origin: vec3.create(),
						direction: vec3.create()
					}
					pick(r.origin, r.direction, mouse, [ 0, 0, width, height ], invProjViewModel)
					let ray = new Ray(r.origin, r.direction)

					if (cubeComplex.cells.some((cell, i) =>
						!!ray.intersectsTriangleCell(cell, cubeComplex.positions))) {
						return { x: i, y: j }
					}
				}
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
		glslify('./shaders/cubes.vert'),
		glslify('./shaders/cubes.frag')
	)

	c.state({
		map: [],
		mapWidth: 0,
		mapHeight: 0
	})

	return c
}

module.exports = createCubeRenderer