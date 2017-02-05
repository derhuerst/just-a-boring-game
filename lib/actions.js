'use strict'

const pack = require('ndarray-pack')
const {randomId} = require('./util')



const addUnit = (game, model) => {
	const units = model.get('units')
	return (x, y) => {
		const id = randomId()
		units.set(id, {x, y})
	}
}

const removeUnit = (game, model) => (x, y) => {
	const units = model.get('units')
	return (id) => {
		if (!units.get(id)) return
		units.set(id, null)
	}
}

const moveUnit = (game, model) => (x, y) => {
	const units = model.get('units')
	const objectives = model.get('objectives')
	return (x, y) => {
		if (!units.get(id)) return
		objectives.set(id, {type: 'move', x, y, start: Date.now()})
	}
}



const selectOwnField = (game, model) => {
	const fields = model.get('fields')
	const id = model.get('player').get()
	return (x, y) => {
		if (!id) return
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
	// const map = game.map()
	// console.warn(mapWidth, mapHeight, map.data)

	return (peerIds, isLeader) => {
		players.push(id)
		fields.set(id, {
			x: Math.round(Math.random() * mapWidth),
			y: Math.round(Math.random() * mapHeight)
		})
		resources.set(id, {a: 100, b: 100, c: 100})

		if (isLeader) {
			// pack(createMap(mapWidth, mapHeight), map)

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

module.exports = {init, addUnit, removeUnit, moveUnit, selectOwnField}
