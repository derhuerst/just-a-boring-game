'use strict'

const signalhub = require('signalhub')
const Peer = require('simple-peer')
const {randomId} = require('./util')

const noop = () => {}

const hub = signalhub('just-a-boring-game', [
	'https://signalhub.jannisr.de',
	// 'https://signalhub.mafintosh.com'
])

const connect = (id, game, channel, initiate, cb = noop) => {
	const replicate = () => {
		const stream = game.replicate()
		peer.pipe(stream).pipe(peer)
		stream.on('synced', () => console.info('initial sync'))
	}

	const peerIds = new Set() // in preparation for multiple peers

	console.info('id:', id, 'channel:', channel, 'initiate:', initiate)
	const peer = new Peer({initiator: initiate, channelName: channel})

	if (process.env.NODE_ENV === 'dev') {
		peer.on('error', (err) => console.error('peer error', err))
		peer.on('connect', () => console.info('peer open'))
		peer.on('close', () => console.warn('peer closed'))
	}
	peer.once('connect', () => cb(peerIds))
	peer.once('connect', replicate)

	const subscription = hub.subscribe(channel)
	subscription.on('data', (signal) => {
		if (signal.from === id) return
		peerIds.add(signal.from)
		peer.signal(signal)
	})

	peer.on('signal', (signal) => {
		signal.from = id
		hub.broadcast(channel, signal)
	})
}

module.exports = {connect}
