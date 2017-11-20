import template from "./template.js"
import transmitter from "/module/transmitter/transmitter.js"

class TestComponent extends HTMLElement {
	constructor() {
		super()

		let shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = template()
		this._button = this.shadowRoot.querySelector('button')
	}

	connectedCallback() {
		this._button.addEventListener('click', this._onClick)
	}

	disconnectedCallback() {
		this._button.removeEventListener('click', this._onClick)
	}

	_onClick() {
		transmitter.publish('a', {r: 'rtrtrt'})
	}
}

customElements.define('test-component2', TestComponent)