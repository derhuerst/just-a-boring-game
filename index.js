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

		if (isLeader) {
			core.set('blocks', blocks.data)
			core.set('leader-field', {x: 0, y: 0})
			core.set('follower-field', {x: 20, y: 20})
		}

		core.on('change', onChange)
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

const onChange = () => {
	blocks.data = core.get('blocks')

	const ownField = isLeader ? core.get('leader-field') : core.get('follower-field')
	const peerField = isLeader ? core.get('follower-field') : core.get('leader-field')

	ui.setBlocks(blocks)
	ui.selectOwnField(ownField)
	ui.selectPeerField(peerField)

	const p = []
	if (ownField && peerField)
		finder.search(ownField.x, ownField.y, peerField.x, peerField.y, p)
}
