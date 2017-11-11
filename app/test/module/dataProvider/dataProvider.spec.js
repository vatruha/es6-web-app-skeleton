import {DataProvider} from "/module/dataProvider/dataProvider.js"
let dataProvider

describe('DataProvider', () => {
	beforeEach(function() {
		dataProvider = new DataProvider()
	})

	afterEach(function() {
		dataProvider = null
	})

	it("should throw an error when there is no initial url", async function () {
		let err = false

		try {
			await dataProvider.loadUrls()
		} catch (e) {
			err = true
		}

		assert.isTrue(err)
	})

	it("should throw an error when the initial url is wrong", async function () {
		let err = false

		try {
			await dataProvider.loadUrls('wrong url')
		} catch (e) {
			err = true
		}


		assert.isTrue(err)
	})

	it("should not throw an error when the initial url is correct", async function () {
		let err = false

		try {
			await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		} catch (e) {
			err = true
		}

		assert.isFalse(err)
	})

	it("should return Response with data when a correct url is used", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url1')
		assert.typeOf(response, 'Response')

		let data = await response.json()

		assert.isObject(data)
		assert.deepEqual(data, {a: 'bbb'})
	})

	it("should wait and return Response with data when a correct url is used and the initial url is set with delay", async function () {
		setTimeout(() => {
			dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		}, 1)
		let response = await dataProvider.load('url1')
		assert.typeOf(response, 'Response')

		let data = await response.json()

		assert.isObject(data)
		assert.deepEqual(data, {a: 'bbb'})
	})

	it("should return false when the initial url is not set", async function () {
		dataProvider.timeToWait = 0
		let response = await dataProvider.load('url1')

		assert.isFalse(response)
		dataProvider.timeToWait = 2000
	})

	it("should return false when a wrong url is used", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')

		let response = await dataProvider.load('url2')

		assert.isFalse(response)
	})

	it("should refill internal Map when the initial url is changed", async function () {
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

	it("should reset internal Map when the initial url is changed and this url is wrong", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url1')
		let data = await response.json()
		assert.deepEqual(data, {a: 'bbb'})
		response = await dataProvider.load('url2')
		assert.isFalse(response)

		dataProvider.timeToWait = 0
		try {
			await dataProvider.loadUrls('/wrong url')
		} catch (e) {}
		response = await dataProvider.load('url1')
		assert.isFalse(response)
		response = await dataProvider.load('url2')
		assert.isFalse(response)
		dataProvider.timeToWait = 2000
	})

	it("should return Response when a correct url is used but file is absent", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider2.data.json')
		let response = await dataProvider.load('url4')
		assert.typeOf(response, 'Response')
	})

	it("should return Response with data when the url has a token", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url3', {id: 1})
		let data = await response.json()
		assert.deepEqual(data, {a: 'bbb'})
	})

	it("should return Response with data when the url has different tokens", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url5', {a: 1, b: 1})
		let data = await response.json()
		assert.deepEqual(data, {g: 'hhh'})
	})

	it("should return Response with data when the url has several the same tokens", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url6', {a: 1})
		let data = await response.json()
		assert.deepEqual(data, {g: 'hhh'})
	})

	it("should return Response and not throw an error with data when params are not Objects", async function () {
		await dataProvider.loadUrls('/test/module/dataProvider/dataProvider1.data.json')
		let response = await dataProvider.load('url6', 'some string')
		assert.typeOf(response, 'Response')
	})
})