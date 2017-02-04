'use strict'

const Hub = require('signalhub')
const Peer = require('simple-peer')

const noop = () => {}

const hub = new Hub('just-a-boring-game', 'https://signalhub.mafintosh.com')

const replicate = (core, channel, initiator, cb = noop) => {
	console.info('initiator?', initiator, 'channel', channel)

	const peer = new Peer({
		initiator,
		channelName: channel,
		// trickle: false // todo: what the hell is this?
	})

	if (process.env.NODE_ENV === 'dev') {
		peer.on('error', (err) => console.error('peer error', err))
		peer.on('connect', () => console.info('peer open'))
		peer.on('close', () => console.warn('peer closed'))
	}

	const subscription = hub.subscribe(channel)
	subscription.on('data', (signal) => {
		if (signal.fromInitiator === initiator) return
		peer.signal(signal)
	})

	peer.on('signal', (signal) => {
		signal.fromInitiator = initiator
		hub.broadcast(channel, signal)
	})
	peer.once('connect', () => subscription.destroy())

	peer.once('connect', () => {
		const c = core.createStream()
		c.pipe(peer).pipe(c)
		cb()
	})
}

module.exports = {replicate}
