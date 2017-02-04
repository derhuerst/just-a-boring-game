'use strict'

let gutterPositions = (n) => {
	let gutter = []
	for (let i = 0; i < 20; i++) {
		gutter.push([ i - 0.5, 0, -0.5 ], [ i - 0.5, 0, 19.5 ])
		gutter.push([ -0.5, 0, i - 0.5 ], [ 19.5, 0, i - 0.5 ])
	}
}

module.exports = gutterPositions