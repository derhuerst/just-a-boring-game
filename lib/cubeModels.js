'use strict'

const mat4 = require('gl-matrix').mat4

let cubeModels = (thearray) => {
	let baseModel = mat4.create()
	mat4.translate(baseModel, baseModel, [ 0, 0.5, 0 ])

	let nx = thearray.shape[0]
	let ny = thearray.shape[1]
	let cubeModels = [new Array().fill(null).map((nx) => [])]

	for (let i = 0; i < nx; i++) {
		for (let j = 0; j < ny; j++) {
			if (thearray.get(i, j)) {
				let newModel = mat4.create()
				mat4.translate(newModel, baseModel, [ i, 0, j ])
				cubeModels[i][j] = newModel
			}
		}
	}

	return cubeModels
}

module.exports = cubeModels