'use strict'

const Model = require('gossip-object')
const {randomId} = require('./util')

const createCore = () => {
	const core = new Model()
	core.add = (key, value) => {
		const id = randomId()
		core.set(id, value)
		core.set(key, value)
		return id
	}
	return core
}

module.exports = createCore
