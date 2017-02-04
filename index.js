'use strict'

const createGame = require('./game')
const {connect} = require('./network')
const ui = require('./ui')
const prompt = require('./channel-prompt')

prompt.onSubmit = (channel, isLeader) => {
	prompt.isWaiting()

	const game = createGame(isLeader)

	connect(game.id(), game, channel, isLeader, (peerIds) => {
		prompt.hide()

		console.info('peers:', ...Array.from(peerIds))
		game.init(peerIds)

		game.on('state', onState)
	})

	ui.onAddBlock = game.addBlock
	ui.onRemoveBlock = game.removeBlock
	ui.onSelectOwnField = game.selectOwnField

	const onState = (state) => {
		const ownField = state[game.id() + '-field']
		console.log('ownField', ownField)
		// todo: support more than one peer
		const peerId = game.peerIds().values().next().value
		console.log('peerId', peerId, game.peerIds())
		const peerField = state[peerId + '-field']
		console.log('peerField', peerField)

		ui.setBlocks(game.map())
		ui.selectOwnField(ownField)
		ui.selectPeerField(peerField)

		const p = game.findPath(ownField.x, ownField.y, peerField.x, peerField.y)
	}
}
