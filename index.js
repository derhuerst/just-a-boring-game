'use strict'

const createCore = require('./core')
const {randomId} = require('./util')
const {replicate} = require('./network')
const ui = require('./ui')

const core = createCore()
replicate(core, () => console.info('connected to peer, replicating'))

core.on('change', () => {
	const i = core.get('selected-cube')
	ui.selectCube(i)
})
ui.onCubeSelect = (i) => {
	core.set('selected-cube', i)
}

// init
core.set('selected-cube', 0)
