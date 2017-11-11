import helpers from "/module/helpers/helpers.js"

describe.only('Helpers', () => {
	describe('timeout()', () => {
		it("should return Promise when execute timeout", function () {
			let result = helpers.timeout(1)
			assert.typeOf(result, 'Promise')
		})

		it("should wait more than 50 milliseconds when execute timeout", async function () {
			let d = new Date()
			let startTime = d.getTime()
			await helpers.timeout(50)
			d = new Date()
			let endTime = d.getTime()
			assert.isAtLeast(endTime - startTime, 50)
		})
	})
})