import helpers from '/module/helpers/helpers.js'

describe('Helpers', () => {
	describe('timeout()', () => {
		it('should return Promise when execute timeout', () => {
			const result = helpers.timeout(1)
			assert.typeOf(result, 'Promise')
		})

		it('should wait more than 50 milliseconds when execute timeout', async () => {
			let d = new Date()
			const startTime = d.getTime()
			await helpers.timeout(50)
			d = new Date()
			const endTime = d.getTime()
			assert.isAtLeast(endTime - startTime, 50)
		})
	})
})
