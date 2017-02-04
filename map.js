'use strict'

const ndarray = require('ndarray')

const createMap = (width = 20, height = 20) =>
	ndarray(new Array(width * height).fill(0), [width, height])

module.exports = createMap
