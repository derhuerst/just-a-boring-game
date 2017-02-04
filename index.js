'use strict'

const createCore = require('./core')
const createMap = require('./map')
const createFinder = require('l1-path-finder')
const {randomId} = require('./util')
const {replicate} = require('./network')
const ui = require('./ui')
const prompt = require('./channel-prompt')

const core = createCore()
const blocks = createMap()
const finder = createFinder(blocks)

let isLeader
prompt.onSubmit = (channel, leader) => {
	isLeader = leader
	prompt.isWaiting()
	replicate(core, channel, isLeader, () => {
		console.info('connected to peer, replicating')
		prompt.hide()

		if (isLeader) core.set('blocks', blocks.data)
	})
}

ui.onAddBlock = (x, y) => {
	blocks.set(x, y, 1)
	core.set('blocks', blocks.data)
}
ui.onRemoveBlock = (x, y) => {
	blocks.set(x, y, 0)
	core.set('blocks', blocks.data)
}
ui.onSelectOwnField = (x, y) => {
	core.set(isLeader ? 'leader-field' : 'follower-field', {x, y})
}

core.on('change', () => {
	blocks.data = core.get('blocks')

	const ownField = isLeader ? core.get('leader-field') : core.get('follower-field')
	const peerField = isLeader ? core.get('follower-field') : core.get('leader-field')

	ui.setBlocks(blocks)
	ui.selectOwnField(ownField)
	ui.selectPeerField(peerField)

	const p = []
	finder.search(ownField.x, ownField.y, peerField.x, peerField.y, p)
})
