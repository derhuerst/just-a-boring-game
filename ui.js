'use strict'



const normals = require('normals')
const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3
const vec4 = require('gl-matrix').vec4
const shell = require('gl-now')({ tickRate: 50 })
const glslify = require('glslify')
const createShader = require('gl-shader')
const createGeometry = require('gl-geometry')

const cube = require('primitive-cube')()
const gutterPositions = require('./gutterPositions.js')

const createCamera = require('./birds-eye-camera.js')
const pick = require('camera-picking-ray')
const Ray = require('ray-3d')





let camera
let cubeGeometry
let gutterGeometry
let shader

let projection  = mat4.create()
let view        = mat4.create()
let gutterModel = mat4.create()
const cubeModels = require('./cubeModels.js')

let hit
let selected



shell.on("gl-init", function() {
	shell.gl.enable(shell.gl.DEPTH_TEST)

	camera = createCamera({
		alignment: [ 0.707, 0, 0.707 ],
		target: [ 0, 0, 0 ],
		distance: 10,
		speed: 20
	})

	cubeGeometry = createGeometry(shell.gl)
	cubeGeometry.attr('position', cube.positions)
	cubeGeometry.attr('normal', cube.normals)
	cubeGeometry.faces(cube.cells)

	gutterGeometry = createGeometry(shell.gl)
	gutterGeometry.attr('position', gutterPositions)

	// shader
	shader = createShader(shell.gl,
		glslify('./shaders/bunny.vert'),
		glslify('./shaders/bunny.frag')
	)
})



shell.bind("move-left", "left", "A")
shell.bind("move-right", "right", "D")
shell.bind("move-forward", "up", "W")
shell.bind("move-backward", "down", "S")

shell.on('tick', (() => {
	let width = 20
	return () => {
		camera.move([
			shell.down("move-forward"),
			shell.down("move-backward"),
			shell.down("move-left"),
			shell.down("move-right")
		])
		camera.rotate(shell.scroll[0])
		camera.zoom(shell.scroll[1]) // Kinda unnecessary given that we employ an orthographic projection later.
		view = camera.view()
		// projection = camera.projection()

		const fieldOfView = Math.PI / 4
		let aspectRatio = shell.width / shell.height
		const near = 0.01 	
		const far  = 500
		width *= Math.exp(shell.scroll[1]/500) // zooming
		let height = width / aspectRatio

		mat4.ortho(
			projection,
			-width/2, width/2, -height/2, height/2,
			near, far)





		let invProjView = mat4.create()
		mat4.multiply(invProjView, projection, view)
		mat4.invert(invProjView, invProjView)

		hit = cubeModels.findIndex((cubeModel) => {
			let invModel = mat4.create()
			let invProjViewModel = mat4.create()
			mat4.invert(invModel, cubeModel)
			mat4.multiply(invProjViewModel, invModel, invProjView)

			let r = {
				origin: vec3.create(),
				direction: vec3.create()
			}
			pick(r.origin, r.direction, [ shell.mouse[0], shell.mouse[1] ], [ 0, 0, shell.width, shell.height ], invProjViewModel)
			let ray = new Ray(r.origin, r.direction)

			return cube.cells.some((cell, i) => !!ray.intersectsTriangleCell(cell, cube.positions))
		})
		if (hit !== -1)
			module.exports.onCubeSelect(hit)
}})())



shell.on("gl-render", (dt) => {
	// let t = performance.now()
	shader.uniforms.uProjection = projection
	shader.uniforms.uView = view
	
	cubeGeometry.bind(shader)
	for (let i = 0; i < cubeModels.length; i++) {
		let cubeModel = cubeModels[i]
		shader.uniforms.uModel = cubeModel
		shader.uniforms.uColor = (hit === i) ? [ 1, 0, 0 ] :
			((selected === i) ? [ 0, 1, 0 ] : [ 0, 0, 0 ])
		cubeGeometry.draw(shell.gl.TRIANGLES)
	}
	
	shader.uniforms.uModel = gutterModel
	shader.uniforms.uColor = [ 0, 0, 0 ]
	gutterGeometry.bind(shader)
	gutterGeometry.draw(shell.gl.LINES)
	
	// console.log((performance.now() - t))
})



shell.on("gl-error", function(e) {
	throw new Error("WebGL not supported :(")
})





module.exports = {
	selectCube: (i) => {
		selected = i
	},

	onCubeSelect: (i) => {
		// console.log(i)
	}
}