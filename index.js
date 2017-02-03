'use strict'

const createCore = require('./core')
const {randomId} = require('./util')
const {replicate} = require('./network')

const core = createCore()
core.set(randomId(), 'foo')

core.on('change', () => {
	console.info('state', core.toJSON())
})

replicate(core, () => {
	console.info('connected to peer, replicating')
})
