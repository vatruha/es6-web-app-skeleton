import {importModule} from "../helpers.js"

describe('simpleComponent', () => {
	let component, root

	before(async function() {
		await importModule('/component/simpleComponent/component.js')
	})

	beforeEach(function() {
		createComponent()
	})

	afterEach(function() {
		removeComponent()
	})

	function createComponent() {
		let body = document.querySelector('body')
		const newComponent = document.createElement('simple-component')
		body.appendChild(newComponent)
		component = document.querySelector('simple-component')
		root = component.shadowRoot
	}

	function removeComponent() {
		component.remove()
		root = null
	}

	it("should contain 2 buttons and input field", function() {
		assert.lengthOf(root.querySelectorAll('button'), 2)
		assert.lengthOf(root.querySelectorAll('input[name="output"][type="text"]'), 1)
	})

	it("should write a text in the input field when a button is pressed", function() {
		let button = root.querySelector('button'), input = root.querySelector('input')
		assert.isEmpty(input.value)

		button.click()
		assert.isNotEmpty(input.value)
	})

	it("should write a correct text in the input field when different buttons are pressed", function() {
		let redButton = root.querySelector('button[value="red"]'),
			greenButton = root.querySelector('button[value="green"]'),
			input = root.querySelector('input')
		assert.isEmpty(input.value)

		redButton.click()
		assert.equal(input.value, 'red')

		greenButton.click()
		assert.equal(input.value, 'green')

		redButton.click()
		assert.equal(input.value, 'red')
	})
})