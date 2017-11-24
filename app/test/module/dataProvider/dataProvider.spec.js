import {DataProvider} from '/module/dataProvider/dataProvider.js'
let dataProvider

describe('DataProvider', () => {
	beforeEach(() => {
		dataProvider = new DataProvider()
	})

	afterEach(() => {
		dataProvider = null
	})

	it('should throw an error when there is no initial url', async () => {
		let err = false

		try {
			await dataProvider.loadUrls()
		} catch (e) {
			err = true
		}

		assert.isTrue(err)
	})

	it('should throw an error when the initial url is wrong', async () => {
		let err = false

		try {
			await dataProvider.loadUrls('wrong url')
		} catch (e) {
			err = true
		}


		assert.isTrue(err)
	})

	it('should not throw an error when the initial url is correct', async () => {
		let err = false

		try {
			await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		} catch (e) {
			err = true
		}

		assert.isFalse(err)
	})

	it('should return Response with data when a correct url is used', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		const response = await dataProvider.load('url1')
		assert.typeOf(response, 'Response')

		const data = await response.json()

		assert.isObject(data)
		assert.deepEqual(data, {a: 'bbb'})
	})

	it('should wait and return Response with data' +
		'when a correct url is used and the initial url is set with delay', async () => {
		setTimeout(() => {
			dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		}, 1)
		const response = await dataProvider.load('url1')
		assert.typeOf(response, 'Response')

		const data = await response.json()

		assert.isObject(data)
		assert.deepEqual(data, {a: 'bbb'})
	})

	it('should return false when the initial url is not set', async () => {
		dataProvider.timeToWait = 0
		const response = await dataProvider.load('url1')

		assert.isFalse(response)
		dataProvider.timeToWait = 2000
	})

	it('should return false when a wrong url is used', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')

		const response = await dataProvider.load('url2')

		assert.isFalse(response)
	})

	it('should refill internal Map when the initial url is changed', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url1')
		let data = await response.json()
		assert.deepEqual(data, {a: 'bbb'})
		response = await dataProvider.load('url2')
		assert.isFalse(response)

		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider2.data.json')
		response = await dataProvider.load('url1')
		assert.isFalse(response)
		response = await dataProvider.load('url2')
		data = await response.json()
		assert.deepEqual(data, {c: 'eeee'})
	})

	it('should reset internal Map when the initial url is changed and this url is wrong', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url1')
		const data = await response.json()
		assert.deepEqual(data, {a: 'bbb'})
		response = await dataProvider.load('url2')
		assert.isFalse(response)

		dataProvider.timeToWait = 0
		try {
			await dataProvider.loadUrls('/wrong url')
		} catch (e) {
			// nothing
		}
		response = await dataProvider.load('url1')
		assert.isFalse(response)
		response = await dataProvider.load('url2')
		assert.isFalse(response)
		dataProvider.timeToWait = 2000
	})

	it('should return Response when a correct url is used but file is absent', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider2.data.json')
		const response = await dataProvider.load('url4')
		assert.typeOf(response, 'Response')
	})

	it('should return Response with data when the url has a token', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		const response = await dataProvider.load('url3', {id: 1})
		const data = await response.json()
		assert.deepEqual(data, {a: 'bbb'})
	})

	it('should return Response with data when the url has different tokens', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		const response = await dataProvider.load('url5', {a: 1, b: 1})
		const data = await response.json()
		assert.deepEqual(data, {g: 'hhh'})
	})

	it('should return Response with data when the url has several the same tokens', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		const response = await dataProvider.load('url6', {a: 1})
		const data = await response.json()
		assert.deepEqual(data, {g: 'hhh'})
	})

	it('should return Response and not throw an error with data when params are not Objects', async () => {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		const response = await dataProvider.load('url6', 'some string')
		assert.typeOf(response, 'Response')
	})
})
