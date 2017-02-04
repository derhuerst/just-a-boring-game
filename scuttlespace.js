'use strict'

const Namespace = {
	get: function (i) {
		const key = this.prefix + i.toString()
		return this.model.get(key)
	},
	set: function (i, v) {
		const key = this.prefix + i.toString()
		this.model.set(key, v)
	},
	isOwnChange: function (key) {
		return key.length > 4 && key.slice(0, 4) === this.prefix
	}
}

Object.defineProperty(Namespace, 'length', {
	enumerable: true,
	getter: function () {
		return this.model.keys().length
	},
	setter: () => {}
})

const createNamespace = (model, prefix) => {
	const ns = Object.create(Namespace)
	ns.model = model
	ns.prefix = prefix + '.'
	return ns
}

module.exports = createNamespace
