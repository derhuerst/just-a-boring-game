'use strict'

const {EventEmitter} = require('events')
const Boat = require('scuttleboat')
const Adapter = require('./scuttlebutt-ndarray')
const RArray = require('r-array')
const RValue = require('r-value')
const Model = require('scuttlebutt/model')
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

	const id = randomId()
	const model = new Boat({constructors: {Adapter, RArray, RValue, Model}})

	const map = model.add('map', 'Adapter')
	const mapView = ndarray(map, [opt.width, opt.height])
	const players = model.add('players', 'RArray')
	const player = model.add('player', 'RValue')
	const fields = model.add('fields', 'Model')
	const resources = model.add('resources', 'Model')

	// game -> model

	const addBlock = (x, y) => {
		mapView.set(x, y, 1)
	}
	const removeBlock = (x, y) => {
		mapView.set(x, y, 0)
	}

	const selectOwnField = (x, y) => {
		fields.set(id, {x, y})
	}

	const init = (peerIds) => {
		players.push(id)
		player.set(id)
		fields.set(id, {
			x: Math.round(Math.random() * opt.width),
			y: Math.round(Math.random() * opt.height)
		})
		resources.set(id, {a: 100, b: 100, c: 100})

		if (isLeader) {
			pack(createMap(opt.width, opt.height), mapView)

			for (let peerId of peerIds) {
				if (peerId === id) continue

				players.push(peerId)
				fields.set(peerId, {
					x: Math.round(Math.random() * opt.width),
					y: Math.round(Math.random() * opt.height)
				})
				resources.set(peerId, {a: 100, b: 100, c: 100})
			}
		}

		model.on('_update', onState)
	}

	// utilities

	const findPath = (fromX, fromY, toX, toY) => {
		const finder = createFinder(mapView)
		const path = []
		finder.search(fromX, fromY, toX, toY, path)
		return path
	}

	// model -> game

	const onState = () => game.emit('state', model.toJSON())

	game.replicate = () => model.createStream()
	game.map = () => mapView
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
