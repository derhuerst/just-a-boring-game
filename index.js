'use strict'

const createCore = require('./core')
const {randomId} = require('./util')
const {replicate} = require('./network')
const ui = require('./ui')
const prompt = require('./channel-prompt')

const core = createCore()

prompt.onSubmit = (channel, intiator) => {
	prompt.isWaiting()
	replicate(core, channel, intiator, () => {
		console.info('connected to peer, replicating')
		prompt.hide()
	})
}

core.on('change', () => {
	const i = core.get('selected-cube')
	ui.selectCube(i)
})
ui.onCubeSelect = (i) => {
	core.set('selected-cube', i)
}

// init
core.set('selected-cube', 0)
