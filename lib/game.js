'use strict'

const {EventEmitter} = require('events')
const Boat = require('scuttleboat')
const Adapter = require('./scuttlebutt-ndarray')
const RArray = require('r-array')
const RValue = require('r-value')
const Model = require('scuttlebutt/model')
const ndarray = require('ndarray')
const {randomId} = require('./util')
const createFinder = require('l1-path-finder')

const actions = require('./actions')

const defaults = {
	width: 20,
	height: 20,
	leader: false
}

const createGame = (isLeader, opt = {}) => {
	opt = Object.assign({}, defaults, opt)

	const game = new EventEmitter()

	// state

	const id = randomId()
	const model = new Boat({constructors: {Adapter, RArray, RValue, Model}})

	const mapWidth = model.add('mapWidth', 'RValue')
	const mapHeight = model.add('mapHeight', 'RValue')
	mapWidth.set(opt.width)
	mapHeight.set(opt.height)
	// const map = model.add('map', 'Adapter')
	// const mapView = ndarray(map, [opt.width, opt.height])

	const players = model.add('players', 'RArray')
	const player = model.add('player', 'RValue')
	player.set(id)
	const fields = model.add('fields', 'Model')
	const resources = model.add('resources', 'Model')
	const units = model.add('units', 'Model')
	const objectives = model.add('objectives', 'Model')

	// utilities

	// const findPath = (fromX, fromY, toX, toY) => {
	// 	const finder = createFinder(mapView)
	// 	const path = []
	// 	finder.search(fromX, fromY, toX, toY, path)
	// 	return path
	// }

	// model -> game

	const onState = () => game.emit('state', model.toJSON())
	model.on('_update', onState)

	game.replicate = () => model.createStream()
	// game.map = () => mapView
	game.id = () => id
	// game.findPath = findPath

	// game -> model
	for (let name in actions) {
		const action = actions[name](game, model)
		game[name] = action
	}

	return game
}

module.exports = createGame
