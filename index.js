'use strict'

const createGame = require('./game')
const {connect} = require('./network')
const ui = require('./ui')
const gui = require('./gui')
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
		gui.setState(state)
		ui.state(state)
	}
}
