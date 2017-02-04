'use strict'

const Model = require('scuttlebutt/model')

const Adapter = function () {
	return Model.call(this)
}

Adapter.prototype = Object.create(Model.prototype)

Object.defineProperty(Adapter.prototype, 'length', {
	enumerable: true,
	get: function () {
		return this.keys().length
	},
	set: () => {}
})

module.exports = Adapter
