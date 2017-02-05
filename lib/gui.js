'use strict'

const css = require('csjs')
const insertCss = require('insert-styles')

const styles = css `
.reset {
	margin: 0;
	padding: 0;
	font-family: sans-serif;
	font-size: 105%;
	background-color: #222;
	color: white;
}
.wrapper {
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

document.body.classList.add(styles.reset)

const hide = (e) => e.style.display = 'none'
const show = (e) => e.style.display = null

const wrapper = document.createElement('div')
wrapper.classList.add(styles.wrapper)
hide(wrapper)
document.body.appendChild(wrapper)

const a = document.createElement('div')
a.classList.add(styles.a)
a.innerText = '0'
wrapper.appendChild(a)

const b = document.createElement('div')
b.classList.add(styles.b)
b.innerText = '0'
wrapper.appendChild(b)

const c = document.createElement('div')
c.classList.add(styles.c)
c.innerText = '0'
wrapper.appendChild(c)

const setState = (state) => {
	const id = state.player
	if (!id) return hide(wrapper)
	show(wrapper)

	const res = state.resources[id]
	a.innerText = res ? res.a.toString() : '–'
	b.innerText = res ? res.b.toString() : '–'
	c.innerText = res ? res.c.toString() : '–'
}

module.exports = {setState}
