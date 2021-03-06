'use strict'

const createGame = require('./lib/game')
const {connect} = require('./lib/network')
const ui = require('./lib/ui')
const gui = require('./lib/gui')

gui.onSubmit = (channel, isLeader) => {
	gui.isWaiting()

	const game = createGame(isLeader)

	connect(game.id(), game, channel, isLeader, (peerIds) => {
		gui.hidePrompt()

		console.info('peers:', ...Array.from(peerIds))
		game.init(peerIds, isLeader)

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
