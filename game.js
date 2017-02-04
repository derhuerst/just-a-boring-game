'use strict'

const {EventEmitter} = require('events')
const Model = require('scuttlebutt/model')
const createNamespace = require('./scuttlespace')
const ndarray = require('ndarray')
const pack = require('ndarray-pack')
const {randomId} = require('./util')
const createFinder = require('l1-path-finder')

const defaults = {
	width: 20,
	height: 20,
	leader: false
}

const createMap = (w, h) => new Array(w).fill(0).map(() => new Array(h).fill(0))

const createGame = (isLeader, opt = {}) => {
	opt = Object.assign({}, defaults, opt)

	const game = new EventEmitter()

	// state

	const model = new Model()

	const mapNS = createNamespace(model, 'map')
	const map = ndarray(mapNS, [opt.width, opt.height])

	const id = randomId()
	let peerIds = new Set()

	// game -> model

	const addBlock = (x, y) => {
		map.set(x, y, 1)
	}
	const removeBlock = (x, y) => {
		map.set(x, y, 0)
	}

	const selectOwnField = (x, y) => {
		model.set(id + '-field', {x, y})
	}

	const init = (_peerIds) => {
		peerIds = _peerIds

		model.set(id + '-field', {
			x: Math.round(Math.random() * opt.width),
			y: Math.round(Math.random() * opt.height)
		})

		if (isLeader) {
			pack(createMap(opt.width, opt.height), map)

			for (let peerId of peerIds) {
				model.set(peerId + '-field', {
					x: Math.round(Math.random() * opt.width),
					y: Math.round(Math.random() * opt.height)
				})
			}
		}
	}

	// utilities

	const findPath = (fromX, fromY, toX, toY) => {
		const finder = createFinder(map)
		const path = []
		finder.search(fromX, fromY, toX, toY, path)
		return path
	}

	// model -> game

	model.on('change', (key, value) => {
		if (mapNS.isOwnChange(key)) return
		game.emit('state', model.toJSON(), key, value)
	})

	game.replicate = () => model.createStream()
	game.map = () => map
	game.id = () => id
	game.peerIds = () => peerIds
	game.addBlock = addBlock
	game.removeBlock = removeBlock
	game.selectOwnField = selectOwnField
	game.init = init
	game.findPath = findPath

	return game
}

module.exports = createGame
