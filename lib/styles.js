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

.hidden {
	display: none !important;
}
`

insertCss(css.getCss(styles))

module.exports = styles
