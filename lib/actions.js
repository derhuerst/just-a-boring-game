'use strict'

const pack = require('ndarray-pack')

const addBlock = (game, model) => (x, y) => {
	const map = game.map()
	map.set(x, y, 1)
}
const removeBlock = (game, model) => (x, y) => {
	const map = game.map()
	map.set(x, y, 0)
}

const selectOwnField = (game, model) => {
	const fields = model.get('fields')
	return (x, y) => {
		fields.set(id, {x, y})
	}
}

const createMap = (w, h) => new Array(w).fill(0).map(() => new Array(h).fill(0))

const init = (game, model) => {
	const id = game.id()
	const players = model.get('players')
	const player = model.get('player')
	const fields = model.get('fields')
	const resources = model.get('resources')
	const mapWidth = model.get('mapWidth').get()
	const mapHeight = model.get('mapHeight').get()
	const map = game.map()
	console.warn(mapWidth, mapHeight, map.data)

	return (peerIds, isLeader) => {
		players.push(id)
		player.set(id)
		fields.set(id, {
			x: Math.round(Math.random() * mapWidth),
			y: Math.round(Math.random() * mapHeight)
		})
		resources.set(id, {a: 100, b: 100, c: 100})

		if (isLeader) {
			pack(createMap(mapWidth, mapHeight), map)

			for (let peerId of peerIds) {
				if (peerId === id) continue

				players.push(peerId)
				fields.set(peerId, {
					x: Math.round(Math.random() * mapWidth),
					y: Math.round(Math.random() * mapHeight)
				})
				resources.set(peerId, {a: 100, b: 100, c: 100})
			}
		}
	}
}

module.exports = {init, addBlock, removeBlock, selectOwnField}
