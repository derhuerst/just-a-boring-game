'use strict'

const createCore = require('./core')
const {randomId} = require('./util')
const {replicate} = require('./network')
const ui = require('./ui')

const core = createCore()

// init
core.set('some-field', 'foo')
ui.change('foo')

core.on('change', () => {
	const value = core.get('some-field')
	ui.change(value)
})
ui.on('change', (value) => {
	core.set('some-field', value)
})

replicate(core, () => {
	console.info('connected to peer, replicating')
})
