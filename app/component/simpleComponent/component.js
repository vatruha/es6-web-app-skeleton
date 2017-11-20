import template from "./template.js"

class SimpleComponent extends HTMLElement {
	constructor() {
		super()
		this._onClick = this._onClick.bind(this)

		this.internalShadowRoot = this.attachShadow({mode: 'open'})
		this.internalShadowRoot.addEventListener('click', this._onClick)
		this.internalShadowRoot.innerHTML = template()
		this._button = this.shadowRoot.querySelector('button')
	}

	disconnectedCallback() {
		this.internalShadowRoot.removeEventListener('click', this._onClick)
	}

	_onClick(e) {
		this.internalShadowRoot.querySelector('input[name="output"]').value = e.target.value
	}
}

customElements.define('simple-component', SimpleComponent)