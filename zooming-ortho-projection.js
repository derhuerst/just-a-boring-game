'use strict'

const mat4 = require('gl-matrix').mat4

const zoomingOrthoProjectionProto = {
	// zoom: Usually the number of pixels scrolled up (negative) or down (positive) since the last call.
	zoom: function (zoom) {
		this.clippingWidth *= Math.exp(zoom/500)
	},

	projection: function () {
		let projection = mat4.create()
		let aspectRatio = this.width / this.height
		let height = this.clippingWidth / aspectRatio
		mat4.ortho(
			projection,
			-this.clippingWidth/2, this.clippingWidth/2, -height/2, height/2,
			this.near, this.far)
		return projection
	}
}

const createZoomingOrthoProjection = (options) => {
	let z = Object.create(zoomingOrthoProjectionProto)

	Object.assign(z, {
		fieldOfView:   Math.PI / 4,
		near:          0.1,
		far:           100,
		clippingWidth: 20 // space units that fit horizontally on normal zoom level. Only to be set in the very beginning.
	}, options) // options should contain canvas width and height

	return z
}

module.exports = createZoomingOrthoProjection