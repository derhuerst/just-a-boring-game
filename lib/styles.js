'use strict'

const css = require('csjs')
const insertCss = require('insert-styles')

const styles = css `
.input {
	margin: .5rem 0;
	padding: .3em .4em;
	font-size: 87%;
	font-weight: inherit;
	line-height: 1;
	color: #ffd41f;
	border: 1px solid #888;
	background-color: #666;
	border-radius: .2em;
	-webkit-appearance: none;
	appearance: none;
}
.input:hover {
	background-color: #707070;
}
.input:focus {
	outline: none;
	border-color: #f1c40f;
	background-color: #f1c40f;
	color: #444;
}

.fullWidth {
	display: block;
	box-sizing: border-box;
	width: 100%;
}

.button {
	padding: .4em;
	cursor: pointer;
	border: none;
	background-color: #f1c40f;
	color: #444;
}
.button:hover {
	background-color: #ffd41f;
}
.button:disabled {
	opacity: .6;
}

.checkbox {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	margin: .1em .3em;
	padding: 0;
	width: 1em;
	height: 1em;
	line-height: inherit;
	font-size: inherit;
	cursor: pointer;
	-webkit-appearance: none;
	appearance: none;
}
.checkbox:focus {
	background-color: #666;
}
.checkbox:checked {
	border-color: #f1c40f;
	background-color: #f1c40f;
}
.checkbox:checked::after {
	position: absolute;
	top: 0;
	left: 0;
	width: 1em;
	line-height: 1em;
	font-size: .9em;
	text-align: center;
	content: '✓';
	color: #666;
	font-weight: bold;
}

.hidden {
	display: none !important;
}
`

insertCss(css.getCss(styles))

module.exports = styles
