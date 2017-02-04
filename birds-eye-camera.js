'use strict'

const vec2 = require('gl-matrix').vec2
const vec3 = require('gl-matrix').vec3
const mat2 = require('gl-matrix').mat2
const mat3 = require('gl-matrix').mat3
const mat4 = require('gl-matrix').mat4



// prototype of all birds eye cameras
const birdsEyeProto = {
	// wsad: An array of 4 ints, usually the number of times w, s, a and d have been pressed since the last call, respectively.
	move: function (dt, wsad) {
		let change = vec2.create()
		change[0] += wsad[0] - wsad[1] 
		change[1] += wsad[2] - wsad[3] // The signs are inverted here because the x-axis points to the right, but a goes to the left.

		let rotation = mat2.create()
		mat2.rotate(rotation, rotation, this.rotationY)
		vec2.transformMat2(change, change, rotation)

		let distanceCovered = dt / 1000 * this.speed * this.distance / 10
		vec2.scale(change, change, distanceCovered)

		this.target[0] -= change[1] // -x is left
		this.target[2] -= change[0] // -z is forwards
	},

	// rotation: Usually the number of pixels scrolled left (positive) or right (negative) since the last call.
	rotate: function (rotation) {
		this.rotationY += Math.PI * rotation / 500 // todo: rotation speed
	},

	// zoom: Usually the number of pixels scrolled up (negative) or down (positive) since the last call.
	zoom: function (zoom) {
		this.distance *= Math.exp(zoom / 500) // todo: zoom speed
	},

	// this.preRotateWorld is determined to be the  4x4 matrix that transforms the world such that this.up is projected to the y axis and this.alignment to the z axis.
	setPlane: function (up, alignment, thirdAxis) {

		if (!thirdAxis) {
			thirdAxis = vec3.create()
			vec3.cross(thirdAxis, this.up, this.alignment)
			vec3.normalize(thirdAxis, thirdAxis)
		}

		this.up = up
		this.alignment = alignment
		this.thirdAxis = thirdAxis

		thirdAxis = [ thirdAxis[0], thirdAxis[1], thirdAxis[2] ] // make sure this is a dynamic array, so that .concat is available
		let preRotateWorld = mat3.fromValues(...(thirdAxis.concat(this.up, this.alignment)))
		mat3.invert(preRotateWorld, preRotateWorld)
		preRotateWorld = mat4.fromValues(
			preRotateWorld[0], preRotateWorld[1], preRotateWorld[2], 0,
			preRotateWorld[3], preRotateWorld[4], preRotateWorld[5], 0,
			preRotateWorld[6], preRotateWorld[7], preRotateWorld[8], 0,
			0, 0, 0, 1
		)

		this.preRotateWorld = preRotateWorld
	},

	view: function () {
		let view = mat4.create()

		// This was never necessary:
		// let cameraRotation = mat4.create()
		// mat4.rotateX(cameraRotation, cameraRotation, this.rotationX)		
		// mat4.rotateY(cameraRotation, cameraRotation, this.rotationY)
		// let cameraRelativeToTarget = [ 0, 0, this.distance ]
		// vec3.transformMat4(cameraRelativeToTarget, cameraRelativeToTarget, cameraRotation)
		// let invCameraPosition = vec3.create()
		// vec3.add(invCameraPosition, this.target, cameraRelativeToTarget)
		// vec3.scale(invCameraPosition, invCameraPosition, -1)
		// // console.log(invCameraPosition)

		// The following is exactly what we want to do, trust me.
		mat4.translate(view, view, [ 0, 0, -this.distance ])
		mat4.rotateX(view, view, -this.rotationX)
		mat4.rotateY(view, view, -this.rotationY)
		mat4.translate(view, view, [ -this.target[0], -this.target[1], -this.target[2] ])
		mat4.multiply(view, view, this.preRotateWorld)

		return view
	}
}


// members
//     read-only
//         .up
//         .alignment
//         .thirdAxis (use .setPlane(up, alignment, thirdAxis) for these 3)
//     read-write
//         .distance
//         .rotationX
//         .speed -- units per key press at the default distance 10. (The actual camera movement speed scales linearly with .distance.)
//         to be changed directly or by .control(dt, wsad, rotate)
//             .rotationY
//              .target -- specifies where to look at in plane coordinates
const createBirdsEye = (options = {}) => {
	let b = Object.create(birdsEyeProto)

	// default values:
	Object.assign(b, {
		up:        [ 0, 1, 0 ], // should be normalized
		alignment: [ 0, 0, 1 ], // should be orthogonal to up and normalized
		distance:  10,
		rotationX: - Math.PI / 4,
		rotationY: 0, // todo: defineProperty read only
		target:    [ 0, 0, 0 ],
		speed:     5 // units covered per second
	}, options)	
	
	b.setPlane(b.up, b.alignment, b.thirdAxis)

	return b
}

module.exports = createBirdsEye