'use strict'

const Model = require('gossip-object')

const randomId = () =>
	(10 + Math.random() * 6 | 0).toString(16)
	+ (.001 + Math.random() * 0.998).toString(16).slice(2)

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

module.export = createCore
