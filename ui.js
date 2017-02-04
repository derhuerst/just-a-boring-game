'use strict'



const normals = require('normals')
const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3
const vec4 = require('gl-matrix').vec4

const shell = require('gl-now')({
	tickRate: 10
})

shell.bind("move-left", "left", "A")
shell.bind("move-right", "right", "D")
shell.bind("move-forward", "up", "W")
shell.bind("move-backward", "down", "S")
shell.bind("rotate-left", "Q")
shell.bind("rotate-right", "E")



const glslify = require('glslify')
const createShader = require('gl-shader')


const createGeometry = require('gl-geometry')

const cube = require('primitive-cube')()

const createCamera = require('./birds-eye-camera.js')





const pick = require('camera-picking-ray')
const Ray = require('ray-3d')
 





let camera
let cubeGeometry
let gutterGeometry
let shader

shell.on("gl-init", function() {
	shell.gl.enable(shell.gl.DEPTH_TEST)
	//shell.gl.enable(shell.gl.CULL_FACE)

	// camera
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

	let gutterPositions = []
	for (let i = -10; i <= 10; i++) {
		gutterPositions.push([ i, 0, -10 ], [ i, 0, 10 ])
		gutterPositions.push([ -10, 0, i ], [ 10, 0, i ])
	}
	gutterGeometry = createGeometry(shell.gl)
	gutterGeometry.attr('position', gutterPositions)

	// shader
	shader = createShader(shell.gl,
	    glslify('./shaders/bunny.vert')
	  , glslify('./shaders/bunny.frag')
	)
})




let projection  = mat4.create()
let view        = mat4.create()
let gutterModel = mat4.create()
let cubeModels  = [ [], [], [], [], [], [], [] ]
cubeModels[0] = mat4.create()
mat4.translate(cubeModels[0], cubeModels[0], [ -7.5, .5, -7.5 ])
for (let i = 1; i <= 6; i++)
	mat4.translate(cubeModels[i], cubeModels[i-1], [ 2, 0, 2 ])
let red = [ 1, 0, 0 ]
let black = [ 0, 0, 0 ]

let hit

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
			pick(r.origin, r.direction, [ shell.mouse[0], shell.height - shell.mouse[0] ], [ 0, 0, shell.width, shell.height ], invProjViewModel)
			let ray = new Ray(r.origin, r.direction)

			return cube.cells.some((cell, i) => !!ray.intersectsTriangleCell(cell, cube.positions))
		})
	}})())




shell.on("gl-render", function(dt) {
	shader.uniforms.uProjection = projection
	shader.uniforms.uView = view
	
	cubeGeometry.bind(shader)
	for (let cubeModel of cubeModels) {
		shader.uniforms.uModel = cubeModel
		shader.uniforms.uColor = (hit === cubeModel) ? red : black
		cubeGeometry.draw(shell.gl.TRIANGLES)
	}
	
	shader.uniforms.uModel = gutterModel
	shader.uniforms.uColor = black
	gutterGeometry.bind(shader)
	gutterGeometry.draw(shell.gl.LINES)
})

shell.on("gl-error", function(e) {
	throw new Error("WebGL not supported :(")
})

module.exports = {
	selectCube: (i) => {
		hit = i
	},

	onCubeSelect: () => {}
}