const readline = require('readline')

const PLAYGROUND_SIZE = [20, 20]
const TAKEN_CELL_CHAR = '*'
const EMPTY_CELL_CHAR = ' '

const ELEMENT1 = [[[true, true, true, true]], [[true], [true], [true], [true]]]
const ELEMENT2 = [
	[
		[true, false],
		[true, false],
		[true, true],
	],
	[
		[true, true, true],
		[true, false, false],
	],
	[
		[true, true],
		[false, true],
		[false, true],
	],
	[
		[false, false, true],
		[true, true, true],
	],
]
const ELEMENT3 = [
	[
		[false, true],
		[false, true],
		[true, true],
	],
	[
		[true, false, false],
		[true, true, true],
	],
	[
		[true, true],
		[true, false],
		[true, false],
		[true, false],
	],
	[
		[true, true, true],
		[false, false, true],
	],
]
const ELEMENT4 = [
	[
		[false, true],
		[true, true],
		[true, false],
	],
	[
		[true, true, false],
		[false, true, true],
	],
]
const ELEMENT5 = [
	[
		[true, true],
		[true, true],
	],
]

const ELEMENTS = [ELEMENT1, ELEMENT2, ELEMENT3, ELEMENT4, ELEMENT5]

let playground = new Array(PLAYGROUND_SIZE[1]).fill(
	new Array(PLAYGROUND_SIZE[0]).fill(false)
)

const random = (max) => {
	return Math.floor(Math.random() * (max + 1))
}
const placeNewElement = () => {
	const element = random(ELEMENTS.length - 1)
	const rotation = random(ELEMENTS[element].length - 1)
	const x = random(PLAYGROUND_SIZE[0] - ELEMENTS[element][rotation][0].length)

	return { element, rotation, x, y: 0 }
}

let currentElement = placeNewElement()

const displayPlayground = () => {
	const shape = ELEMENTS[currentElement.element][currentElement.rotation]
	for (let row = 0; row < PLAYGROUND_SIZE[1]; row++) {
		let asciiRow = TAKEN_CELL_CHAR // left edge
		for (let column = 0; column < PLAYGROUND_SIZE[0]; column++) {
			let taken = playground[row][column]

			// overlay current element
			let elX = column - currentElement.x
			let elY = row - currentElement.y
			if (
				elX >= 0 &&
				elX < shape[0].length &&
				elY >= 0 &&
				elY < shape.length
			) {
				if (shape[elY][elX]) taken = true
			}
			asciiRow += taken ? TAKEN_CELL_CHAR : EMPTY_CELL_CHAR
		}
		asciiRow += TAKEN_CELL_CHAR // right edge
		console.log(asciiRow)
	}

	// bottom line
	console.log(
		new Array(PLAYGROUND_SIZE[0] + 2).fill(TAKEN_CELL_CHAR).join('')
	)
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

rl.on('close', () => {
	process.exit(0)
})

const quit = () => {
	rl.close()
}

const checkPosition = ({ element, rotation, x, y }) => {
	const shape = ELEMENTS[element][rotation]
	if (x + shape[0].length > PLAYGROUND_SIZE[0]) return false
	if (x < 0) return false
	if (y + shape.length > PLAYGROUND_SIZE[1]) return false

	for (let row = 0; row < shape.length; row++) {
		for (let column = 0; column < shape[0].length; column++) {
			if (shape[row][column]) {
				if (playground[row + y][column + x]) {
					return false
				}
			}
		}
	}
	return true
}

const getPossibleCommands = ({ element, rotation, x, y }) => {
	const commands = {}

	// check left
	const left = {
		element,
		rotation,
		x: x - 1,
		y: y + 1,
	}
	if (checkPosition(left)) {
		commands.left = left
	}
	// check right
	const right = {
		element,
		rotation,
		x: x + 1,
		y: y + 1,
	}
	if (checkPosition(right)) {
		commands.right = right
	}

	// check rotations
	const rotationsCount = ELEMENTS[element].length
	if (rotationsCount > 1) {
		const rotateLeft = {
			element,
			rotation: (rotation + rotationsCount - 1) % rotationsCount,
			x,
			y: y + 1,
		}
		if (checkPosition(rotateLeft)) {
			commands.rotateLeft = rotateLeft
		}
		const rotateRight = {
			element,
			rotation: (rotation + 1) % rotationsCount,
			x,
			y: y + 1,
		}
		if (checkPosition(rotateRight)) {
			commands.rotateRight = rotateRight
		}
	}

	return commands
}

const elementDone = ({ element, rotation, x, y }) => {
	const shape = ELEMENTS[element][rotation]
	for (let row = 0; row < shape.length; row++) {
		for (let column = 0; column < shape[0].length; column++) {
			if (shape[row][column]) {
				let newRow = [...playground[row + y]]
				newRow[column + x] = true
				playground[row + y] = [...newRow]
			}
		}
	}
}
const waitForCommand = () => {
	console.clear()

	let commands = getPossibleCommands({ ...currentElement })

	if (Object.keys(commands).length === 0) {
		// no moves possible
		elementDone({ ...currentElement })
		const newElement = placeNewElement()
		if (!checkPosition({ ...newElement })) {
			displayPlayground()
			// eslint-disable-next-line quotes
			console.log("Can't place new element, exiting...")
			quit()
		} else {
			currentElement = { ...newElement }
			commands = getPossibleCommands({ ...currentElement })
			if (Object.keys(commands).length === 0) {
				displayPlayground()
				console.log('\n\nNo possible movements, exiting...')
				quit()
			}
		}
	}

	displayPlayground()

	if (Object.keys(commands).length > 0) {
		rl.question(
			'\nAvailable commands:\na / d / w / s / q    (move left / right / rotate counter clockwise / clockwise / quit - WTF? really?)\nEnter your command: ',
			(command) => {
				command = command.toLowerCase()
				if (command === 'q') {
					quit()
				}
				if (command === 'a') {
					if (commands.left) {
						currentElement = { ...commands.left }
					}
				}
				if (command === 'd') {
					if (commands.right) {
						currentElement = { ...commands.right }
					}
				}
				if (command === 'w') {
					if (commands.rotateLeft) {
						currentElement = { ...commands.rotateLeft }
					}
				}
				if (command === 's') {
					if (commands.rotateRight) {
						currentElement = { ...commands.rotateRight }
					}
				}
				waitForCommand()
			}
		)
	} else {
		waitForCommand()
	}
}

waitForCommand()
