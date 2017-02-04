'use strict'

let gutterPositions = []
for (let i = -10; i <= 10; i++) {
	gutterPositions.push([ i, 0, -10 ], [ i, 0, 10 ])
	gutterPositions.push([ -10, 0, i ], [ 10, 0, i ])
}

module.exports = gutterPositions