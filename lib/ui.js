'use strict'



const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3
const vec4 = require('gl-matrix').vec4
const createContext = require('gl-context')
var fit = require('canvas-fit')



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
	map: [],
	mapWidth: 20,
	mapHeight: 20
}
state.map = new Array(400).fill(false)
state.map[200] = true
state.map[201] = true
state.map[210] = true




const canvas = document.createElement('canvas')
document.body.appendChild(canvas) 

window.addEventListener('resize', () => { fit(canvas, window, window.devicePixelRatio); console.log(gl.drawingBufferWidth, gl.drawingBufferHeight) }, false)
fit(canvas, window, window.devicePixelRatio)
const mouse = require('mouse-position')(canvas)
const scroll = require('scroll-speed')(canvas, true)
let timeOld = Date.now()

const gl = createContext(canvas, {
	premultipliedAlpha: false
}, render)
init()



function init () {
	gl.enable(gl.DEPTH_TEST)

	camera = createCamera({
		alignment: [ -0.707, 0, -0.707 ],
		target: [ 0, 0, 0 ],
		distance: 10,
		speed: 20
	})
	zoomingOrthoProjection = createZoomingOrthoProjection({
		width: gl.drawingBufferWidth,
		height: gl.drawingBufferHeight
	})
	planeRenderer = createPlaneRenderer(gl)
	planeRenderer.state(state)
	cubesRenderer = createCubesRenderer(gl)
	cubesRenderer.state(state)


	canvas.addEventListener('click', (e) => {
		let hit = cubesRenderer.hit(mouse, gl.drawingBufferWidth, gl.drawingBufferHeight, view, projection)
		if (hit) {
			module.exports.onRemoveBlock(hit.x, hit.y)
		} else {
			let field = planeRenderer.hit(mouse, gl.drawingBufferWidth, gl.drawingBufferHeight, view, projection)
			if (field) {
				if (e.shiftKey) {
					module.exports.onAddBlock(field.x, field.y)
				} else {
					module.exports.onSelectOwnField(field.x, field.y)
				}
			}
		}
	}, false)
}




function render () {
	let timeNew = Date.now()

	// camera.move(timeNew - timeOld, [
	// 	shell.down("move-forward"),
	// 	shell.down("move-backward"),
	// 	shell.down("move-left"),
	// 	shell.down("move-right")
	// ])
	camera.rotate(scroll[0])
	camera.zoom(scroll[1]) // Kinda unnecessary given that we employ an orthographic projection later.
	view = camera.view()
		
	zoomingOrthoProjection.width = gl.drawingBufferWidth
	zoomingOrthoProjection.height = gl.drawingBufferHeight
	zoomingOrthoProjection.zoom(scroll[1])
	projection = zoomingOrthoProjection.projection()
	console.log(projection)



	planeRenderer.render(projection, view)
	cubesRenderer.render(projection, view)



	timeOld = timeNew
	mouse.flush()
	scroll.flush()


}





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