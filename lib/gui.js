'use strict'

const css = require('csjs')
const insertCss = require('insert-styles')
const {input, fullWidth, button, checkbox, hidden} = require('./styles')

const styles = css `
.body {
	margin: 0;
	padding: 0;
	font-family: sans-serif;
	font-size: 105%;
	background-color: #222;
	color: white;
}

.prompt {
	position: absolute;
	top: 5em;
	left: 50%;
	z-index: 100;
	margin-left: -11em;
	width: 100%;
	max-width: 20em;
	padding: 1em;
	background-color: #444;
}

.panel {
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 10;
	display: flex;
	color: white;
	background-color: #444;
}

.a, .b, .c {
	margin: 0 .5em;
}
.a::before, .b::before, .c::before {
	margin-right: .25em;
}
.a::before {
	content: '💚'
}
.b::before {
	content: '🌈'
}
.c::before {
	content: '🌟'
}
`
insertCss(css.getCss(styles))
document.body.classList.add(styles.body)

const gui = {}



// channel prompt

const prompt = document.createElement('div')
prompt.classList.add(styles.prompt)
document.body.appendChild(prompt)

const channel = document.createElement('input')
channel.classList.add(input, fullWidth)
channel.value = 'default'
prompt.appendChild(channel)

const label = document.createElement('label')
label.innerText = 'host'
prompt.appendChild(label)

const initiator = document.createElement('input')
initiator.setAttribute('type', 'checkbox')
initiator.classList.add(input, checkbox)
initiator.checked = true
label.appendChild(initiator)

const submit = document.createElement('button')
submit.innerText = 'connect!'
submit.classList.add(input, fullWidth, button)
prompt.appendChild(submit)

const isWaiting = () => {
	submit.disabled = true
	submit.innerText = 'waiting…'
}

const hidePrompt = () => {
	prompt.classList.add(hidden)
}

submit.addEventListener('click', () => {
	gui.onSubmit(channel.value, !initiator.checked)
})



// panel

const panel = document.createElement('div')
panel.classList.add(styles.panel, hidden)
document.body.appendChild(panel)

const a = document.createElement('div')
a.classList.add(styles.a)
a.innerText = '0'
panel.appendChild(a)

const b = document.createElement('div')
b.classList.add(styles.b)
b.innerText = '0'
panel.appendChild(b)

const c = document.createElement('div')
c.classList.add(styles.c)
c.innerText = '0'
panel.appendChild(c)

const setState = (state) => {
	const id = state.player
	if (!id) {
		panel.classList.add(hidden)
		return
	}
	panel.classList.remove(hidden)

	const res = state.resources[id]
	a.innerText = res ? res.a.toString() : '–'
	b.innerText = res ? res.b.toString() : '–'
	c.innerText = res ? res.c.toString() : '–'
}



Object.assign(gui, {
	isWaiting, hidePrompt, onSubmit: () => {},
	setState
})
module.exports = gui
