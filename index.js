'use strict'

const createCore = require('./core')
const createMap = require('./map')
const createFinder = require('l1-path-finder')
const {randomId} = require('./util')
const {replicate} = require('./network')
const ui = require('./ui')
const prompt = require('./channel-prompt')

let id, peerIds
const core = createCore()
const blocks = createMap()
const finder = createFinder(blocks)

prompt.onSubmit = (channel, isLeader) => {
	prompt.isWaiting()
	id = replicate(core, channel, isLeader, (_peerIds) => {
		prompt.hide()

		peerIds = _peerIds
		console.info('connected to peers', ...Array.from(peerIds))

		if (isLeader) {
			core.set('blocks', blocks.data)
			for (let peerId of peerIds)
				core.set(peerId + '-field', {
					x: Math.round(Math.random() * 20),
					y: Math.round(Math.random() * 20)
				})
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
	core.set(id + '-field', {x, y})
}

const onChange = (key, value) => {
	// todo: don't update if own message
	blocks.data = core.get('blocks')

	const ownField = core.get(id + '-field')
	// todo: support more than one peer
	const peerId = peerIds.values().next().value
	const peerField = core.get(peerId + '-field')

	ui.setBlocks(blocks)
	ui.selectOwnField(ownField)
	ui.selectPeerField(peerField)

	const p = []
	if (ownField && peerField)
		finder.search(ownField.x, ownField.y, peerField.x, peerField.y, p)
}
