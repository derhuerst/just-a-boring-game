'use strict'

const css = require('csjs')
const insertCss = require('insert-styles')

const styles = css `
.wrapper {
	position: absolute;
	top: 5em;
	left: 50%;
	z-index: 100;
	margin-left: -10em;
	width: 100%;
	max-width: 20em;
	padding: 1em;
	display: flex;
	background-color: #444;
}
.fullWidth {
	box-sizing: border-box;
	width: 100%;
}
`
insertCss(css.getCss(styles))

const wrapper = document.createElement('div')
wrapper.setAttribute('class', styles.wrapper)
document.body.appendChild(wrapper)

const channel = document.createElement('input')
channel.setAttribute('class', styles.fullWidth)
channel.value = 'default'
wrapper.appendChild(channel)

const label = document.createElement('label')
label.innerText = 'host'
wrapper.appendChild(label)
const initiator = document.createElement('input')
initiator.setAttribute('type', 'checkbox')
initiator.checked = true
label.appendChild(initiator)

const submit = document.createElement('button')
submit.innerText = 'connect!'
submit.setAttribute('class', styles.fullWidth)
wrapper.appendChild(submit)

const hide = () => {
	wrapper.style.display = 'none'
}

const isWaiting = () => {
	submit.disabled = true
	submit.innerText = 'waiting…'
}

submit.addEventListener('click', () => {
	prompt.onSubmit(channel.value, !initiator.checked)
})

const prompt = {
	hide,
	isWaiting,
	onSubmit: () => {}
}
module.exports = prompt
