'use strict'

const Model = require('scuttlebutt/model')
const {randomId} = require('./util')

const createCore = () => new Model()

module.exports = createCore
