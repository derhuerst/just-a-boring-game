'use strict'

const mat4 = require('gl-matrix').mat4

let cubeModels = new Array(7).fill(null).map(() => [])
cubeModels[0] = mat4.create()
mat4.translate(cubeModels[0], cubeModels[0], [ -7.5, .5, -7.5 ])
for (let i = 1; i < cubeModels.length; i++)
	mat4.translate(cubeModels[i], cubeModels[i-1], [ 1, 0, 1 ])

module.exports = cubeModels