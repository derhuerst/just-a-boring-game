'use strict'



const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3
const vec4 = require('gl-matrix').vec4
const shell = require('gl-now')({ tickRate: 50 })


const createCamera = require('./birds-eye-camera')
const createZoomingOrthoProjection = require('./zooming-ortho-projection')
const createPlaneRenderer = require('./planeRenderer')
const createCubesRenderer = require('./cubesRenderer')






let camera
let zoomingOrthoProjection
let planeRenderer
let cubesRenderer

let projection  = mat4.create()
let view    = mat4.create()


let state = {
	units: {
		"id0": {
			x: 5,
			y: 5
		},
		"id1": {
			x: 17,
			y: 13
		}	
	},
	fields: {
		"player-id0": {
			x: 10,
			y: 4
		},
		"player-id1": {
			x: 11,
			y: 5
		}
	},
	players: {
		"player-id0": {
			color: [ 1, 0, 0 ]
		},
		"player-id1": {
			color: [ 0, 1, 0 ]
		}
	},
	resources: {
		"id1": {
			"gold": 20,
			"wood": 10
		}
	},
	mapWidth: 20,
	mapHeight: 20
}



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
	planeRenderer = createPlaneRenderer(shell.gl)
	planeRenderer.state(state)
	cubesRenderer = createCubesRenderer(shell.gl)
	cubesRenderer.state(state)


	shell.element.addEventListener('click', (e) => {
		let hit = cubesRenderer.hit(shell.mouse, shell.width, shell.height, view, projection)
		if (hit) {
			module.exports.onRemoveBlock(hit.x, hit.y)
		} else {
			let field = planeRenderer.hit(shell.mouse, shell.width, shell.height, view, projection)
			if (field) {
				if (e.shiftKey) {
					module.exports.onAddBlock(field.x, field.y)
				} else {
					module.exports.onSelectOwnField(field.x, field.y)
				}
			}
		}
	}, false)
})



shell.bind("move-left", "left", "A")
shell.bind("move-right", "right", "D")
shell.bind("move-forward", "up", "W")
shell.bind("move-backward", "down", "S")





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


	planeRenderer.render(projection, view)
	cubesRenderer.render(projection, view)
})



shell.on("gl-error", function(e) {
	throw new Error("WebGL not supported :(")
})





module.exports = {
	state: (state) => {
		planeRenderer.state(state)
		cubesRenderer.state(state)
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