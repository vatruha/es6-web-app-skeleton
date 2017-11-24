import helpers from '/module/helpers/helpers.js'

async function fetchAsync(url) {
	return fetch(url)
}

function isIterable(obj) {
	// checks for null and undefined
	if (obj == null) {
		return false
	}
	return typeof obj[Symbol.iterator] === 'function'
}

class DataProvider {
	constructor() {
		this.urls = new Map()
		this.timeToWait = 2000
	}

	set timeToWait(timeToWaitInMilliseconds) {
		this.timeToWaitInMilliseconds = timeToWaitInMilliseconds
	}

	async loadUrls(baseUrl) {
		try {
			const response = await fetchAsync(baseUrl)
			this.urls = new Map(Object.entries(await response.json()))
		} catch (e) {
			this.urls = new Map()
			throw new Error('Data is not loaded')
		}
	}

	async load(url, params) {
		let response
		try {
			let counter = this.timeToWaitInMilliseconds / 50
			while (this.urls.size === 0 && counter > 0) {
				await helpers.timeout(50)
				counter--
			}

			if (!this.urls.has(url)) {
				throw new Error('Wrong url')
			}

			let requestUrl = this.urls.get(url)
			requestUrl = this._insertTokensIntoUrl(requestUrl, params)
			response = await fetchAsync(requestUrl)
		} catch (e) {
			response = false
		}

		return response
	}

	_insertTokensIntoUrl(requestUrl, params) {
		if (typeof params === 'object') {
			const paramsMap = new Map(Object.entries(params))

			if (isIterable(paramsMap)) {
				for (const pair of paramsMap) {
					requestUrl = requestUrl.replace(new RegExp('%' + pair[0] + '%', 'g'), pair[1])
				}
			}
		}

		return requestUrl
	}
}

const dataProvider = new DataProvider()
export {dataProvider, DataProvider}
