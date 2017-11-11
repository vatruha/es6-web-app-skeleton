import template from "./template.js"
import transmitter from "/module/transmitter/transmitter.js"

class TestComponent extends HTMLElement {
	constructor() {
		super()

		let shadowRoot = this.attachShadow({mode: 'open'})
		shadowRoot.innerHTML = template({status:'unknown'})
		this._bind = this.shadowRoot.querySelector('#bind')
		this._unbind = this.shadowRoot.querySelector('#unbind')
	}

	connectedCallback() {
		this._bind.addEventListener('click', this._bindButton)
		this._unbind.addEventListener('click', this._unbindButton)
	}

	disconnectedCallback() {
		this._bind.removeEventListener('click', this._bindButton)
		this._unbind.removeEventListener('click', this._unbindButton)
	}

	_bindButton() {
		transmitter.subscribe('a', (q, message) => (console.log(q, message)))
	}

	_unbindButton() {
		// pubSub.subscribe('a', (q) => (console.log(q)))
	}
}

customElements.define('test-component1', TestComponent)