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
const gutterPositions = require('./gutterPositions.js')(20)

const createCamera = require('./birds-eye-camera.js')
const createZoomingOrthoProjection = require('./zooming-ortho-projection.js')
const pick = require('camera-picking-ray')
const Ray = require('ray-3d')





let camera
let zoomingOrthoProjection
let cubeGeometry
let gutterGeometry
let shader

let projection  = mat4.create()
let view        = mat4.create()
let gutterModel = mat4.create()
const getCubeModels = require('./cubeModels.js')
let cubes = []
let cubeModels = []

let ownField
let peerField
let hit



shell.on("gl-init", function() {
	shell.gl.enable(shell.gl.DEPTH_TEST)

	camera = createCamera({
		alignment: [ -0.707, 0, -0.707 ],
		target: [ 0, 0, 0 ],
		distance: 10,
		speed: 20
	})
	zoomingOrthoProjection = createZoomingOrthoProjection({
		width: shell.width,
		height: shell.height
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


	shell.element.addEventListener('click', (e) => {
		hit = calculateCubeHit(shell.mouse, shell.width, shell.height, cube, cubeModels, view, projection)
		if (hit) {
			module.exports.onRemoveBlock(hit.x, hit.y)
		} else {
			let field = calculatePlaneHit(shell.mouse, shell.width, shell.height, view, projection)
			if (field) {
				if (e.button === 0) {
					module.exports.onSelectField(field.x, field.y)
				} else if (e.button === 1) {
					module.exports.onAddBlock(field.x, field.y)
				}
			}
		}
	}, false)
})



shell.bind("move-left", "left", "A")
shell.bind("move-right", "right", "D")
shell.bind("move-forward", "up", "W")
shell.bind("move-backward", "down", "S")

let calculateCubeHit = (mouse, width, height, geometry, models, view, projection) => {
	let invProjView = mat4.create()
	mat4.multiply(invProjView, projection, view)
	mat4.invert(invProjView, invProjView)

	for (let i = 0; i < blocks.shape[0]; i++) {
		for (let j = 0; j < blocks.shape[1]; j++) {
			let cubeModel = cubeModels[i][j]
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

			if (cube.cells.some((cell, i) => !!ray.intersectsTriangleCell(cell, cube.positions)))
				return { x: i, y: j }
		}
	}

	return null
}



let calculatePlaneHit = (mouse, width, height, view, projection) => {
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



let timeOld = Date.now()
shell.on("gl-render", () => {
	let timeNew = Date.now()

	camera.move(timeNew - timeOld, [
		shell.down("move-forward"),
		shell.down("move-backward"),
		shell.down("move-left"),
		shell.down("move-right")
	])
	camera.rotate(shell.scroll[0])
	camera.zoom(shell.scroll[1]) // Kinda unnecessary given that we employ an orthographic projection later.
	view = camera.view()
		
	zoomingOrthoProjection.width = shell.width
	zoomingOrthoProjection.height = shell.height
	zoomingOrthoProjection.zoom(shell.scroll[1])
	projection = zoomingOrthoProjection.projection()

	timeOld = timeNew

	shader.uniforms.uProjection = projection
	shader.uniforms.uView = view





	
	cubeGeometry.bind(shader)

	let nx = cubes.shape[0]
	let ny = cubes.shape[1]
	for (let i = 0; i < nx; i++) {
		for (let j = 0; j < ny; j++) {
			if (cubes.get(i, j)) {
				shader.uniforms.uModel = cubeModels[i][j]

				if (hit.x === i && hit.y === j) {
					shader.uniforms.uColor = [ 1, 0, 0 ]
				} else if (ownField.x === i && ownField.y === j) {
					shader.uniforms.uColor = [ 0, 1, 0 ]
				} else if (peerField.x === i && peerField.y === j) {
					shader.uniforms.uColor = [ 0, 0, 1 ]
				} else {
					shader.uniforms.uColor = [ 0, 0, 0 ]
				}
				cubeGeometry.draw(shell.gl.TRIANGLES)
			}
		}
	}
	
	shader.uniforms.uModel = gutterModel
	shader.uniforms.uColor = [ 0, 0, 0 ]
	gutterGeometry.bind(shader)
	gutterGeometry.draw(shell.gl.LINES)
})



shell.on("gl-error", function(e) {
	throw new Error("WebGL not supported :(")
})





module.exports = {
	setBlocks: (blocks) => {
		cubes = blocks
		cubeModels = getCubeModels(blocks)
	},

	selectOwnField: (x, y) => {
		ownField.x = x
		ownField.y = y
	},

	selectPeerField: (x, y) => {
		peerField.x = x
		peerField.y = y
	},

	onAddBlock: (x, y) => {
		console.log('add block', x, y)
	},

	onRemoveBlock: (x, y) => {
		console.log('remove block', x, y)
	},

	onSelectOwnField: (x, y) => {
		console.log('select field', x, y)
	}
}