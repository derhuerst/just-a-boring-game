'use strict'

const randomId = () =>
	(10 + Math.random() * 6 | 0).toString(16)
	+ (.001 + Math.random() * 0.998).toString(16).slice(2)

module.exports = {randomId}
