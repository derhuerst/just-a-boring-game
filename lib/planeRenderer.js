'use strict'

const mat4 = require('gl-matrix').mat4
const vec3 = require('gl-matrix').vec3

const createGeometry = require('gl-geometry')
const glslify = require('glslify')
const createShader = require('gl-shader')

const pick = require('camera-picking-ray')
const Ray = require('ray-3d')



const tile = {
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



const createGutter = (() => {
	let lastWidth = null
	let lastHeight = null
	let lastResult = null
	return (width, height) => {
		if (lastWidth === width && lastHeight === height)
			return lastResult

		let gutter = []
		for (let i = 0; i <= width; i++) {
			gutter.push([ i, 0, 0 ], [ i, 0, height ])
			gutter.push([ 0, 0, i ], [ height, 0, i ])
		}

		lastWidth = width
		lastHeight = height
		lastResult = gutter
		return gutter
	}
})()




const planeRendererProto = {
	state: function (state) {
		this.gutterGeometry.attr('position', createGutter(state.mapWidth, state.mapHeight))

		this._players = state.players // save .players for the colors
		this.tiles = Object.entries(state.fields)
			.map(([ id, { x, y } ]) => {
				let m = mat4.create()
				mat4.translate(m, this.gutterModel, [ x, 0, y ])
				return {
					model: m,
					x: x,
					y: y,
					id: id
				}
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
		for (let t of this.tiles) {
			this.tileShader.uniforms.uModel = t.model
			if (this._players[t.id]) {
				let color = this._players[t.id]
				color = [ color[0] / 255, color[1] / 255, color[3] / 255 ]
				this.tileShader.uniforms.uColor = color
				this.tileGeometry.draw(this.gl.TRIANGLES)
			}
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
		/* default options */
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
		fields: { },
		players: { }
	})

	return p
}

module.exports = createPlaneRenderer
