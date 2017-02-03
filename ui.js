'use strict'

const {EventEmitter} = require('events')

const el = document.createElement('input')
document.body.appendChild(el)

const change = (value) => {
	el.value = value
}

el.addEventListener('keypress', () => {
	ui.emit('change', el.value)
})

const ui = new EventEmitter()
ui.change = change

module.exports = ui
