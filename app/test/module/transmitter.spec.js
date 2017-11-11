import {Transmitter} from "/module/transmitter/transmitter.js"
import helpers from "/module/helpers/helpers.js"
let transmitter

/**
 * Generate unique strings
 * @returns {string}
 */
function getUniqueString() {
	if (getUniqueString.uid === undefined) {
		getUniqueString.uid = 0
	}
	getUniqueString.uid++

	return "Unique string " + getUniqueString.uid.toString()
}

/**
 * Make sure that all tokens in the passed array are different
 * @param tokens
 */
function assertAllTokensDifferent(tokens) {
	let length = tokens.length

	assert.isAbove(length, 0)

	// compare all tokens
	for (let i = 0; i < length; i++) {
		for (let j = i + 1; j < length; j++) {
			assert.notEqual(tokens[i], tokens[j])
		}
	}
}

describe('Transmitter', () => {
	beforeEach(function() {
		transmitter = new Transmitter()
	})

	afterEach(function() {
		transmitter = null
	})

	describe('subscribe()', () => {
		it("should return token as String", function () {
			let callback = sinon.spy()
			assert.isString(transmitter.subscribe(getUniqueString(), callback))
		})

		it("should return false when a subscriber is not a function", function () {
			let topic = getUniqueString(),
				invalidSubscribers = [undefined, null, 'a string', 123, [], {}, new Date()]

			invalidSubscribers.forEach(function (callback) {
				assert.isFalse(transmitter.subscribe(topic, callback))
			})
		})

		it("should return false when a topic is not a string", function () {
			let callback = sinon.spy(),
				invalidTopics = [undefined, null, 123, [], {}, new Date()]

			invalidTopics.forEach(function (topic) {
				assert.isFalse(transmitter.subscribe(topic, callback))
			})
		})

		it("should return unique tokens for several subscriptions with the same callback", function () {
			let tokens = [], callback = sinon.spy()

			for (let i = 0; i < 10; i++) {
				tokens.push(transmitter.subscribe(getUniqueString(), callback))
			}

			assertAllTokensDifferent(tokens)
		})

		it("should return unique tokens for different subscribers", function () {
			let topic = getUniqueString(),
				tokens = [],
				getCallback = function (value) {
					return function () {
						return value
					}
				}

			for (let i = 0; i < 10; i++) {
				tokens.push(transmitter.subscribe(topic, getCallback(i)))
			}

			assertAllTokensDifferent(tokens)
		})
	})

	describe('publish()', () => {
		it("should return false when a topic is not a string", function () {
			let invalidTopics = [undefined, null, 123, [], {}, new Date()]

			invalidTopics.forEach(function (topic) {
				assert.isFalse(transmitter.publish(topic, getUniqueString()))
			})
		})

		it("should return true when publishing", function () {
			let topic = getUniqueString(),
				callback = sinon.spy()

			transmitter.subscribe(topic, callback)

			assert.isTrue(transmitter.publish(topic, getUniqueString()))
		})

		it("should call callback async when publishing", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)

			transmitter.publish(topic, getUniqueString())
			assert.isTrue(callback.notCalled)

			clock.tick(1)
			assert.isTrue(callback.calledOnce)
			clock.restore()
		})

		it("should pass a correct message into a callback and call it when publishing", function () {
			let topic = getUniqueString(),
				message = {'q': getUniqueString(), 'w': getUniqueString()},
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.publish(topic, message)
			clock.tick(1)

			assert.isTrue(callback.calledOnce)
			assert.deepEqual(callback.args[0], [topic, message])
			clock.restore()
		})

		it("should return true when publishing without subscribers assigned to that topic", function () {
			let callback = sinon.spy()

			transmitter.subscribe(getUniqueString(), callback)
			assert.isTrue(transmitter.publish(getUniqueString(), getUniqueString()))
		})

		it("should call the same callback several times when publishing a message to the same topic several times", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.publish(topic, getUniqueString())
			transmitter.publish(topic, getUniqueString())
			transmitter.publish(topic, getUniqueString())
			clock.tick(1)

			assert.isTrue(callback.calledThrice)
			clock.restore()
		})

		it("after clearing of all subscriptions should return true when publishing", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.clearAllSubscriptions()
			assert.isTrue(transmitter.publish(topic, getUniqueString()))
			clock.restore()
		})

		it("after clearing of all subscriptions should not call a callback when publishing", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.clearAllSubscriptions()
			transmitter.publish(topic, getUniqueString())
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it("should call all subscribers, even if there are exceptions", async function () {
			let topic = getUniqueString(),
				callbackInException = sinon.spy(),
				stub = sinon.stub(transmitter, "_triggerException").callsFake(callbackInException),
				callback1 = function () {
					throw new Error('some error')
				},
				callback2 = sinon.spy(),
				callback3 = sinon.spy()

			transmitter.subscribe(topic, callback1)
			transmitter.subscribe(topic, callback2)
			transmitter.subscribe(topic, callback3)
			transmitter.publish(topic, getUniqueString())
			await helpers.timeout(30)

			assert.isTrue(callback2.calledOnce)
			assert.isTrue(callback3.calledOnce)
			assert.isTrue(callbackInException.calledOnce)
			assert.isTrue(callbackInException.calledAfter(callback3))
			stub.restore()
		})
	})

	describe('unsubscribe()', () => {
		it("should return true when unsubscribe all", function () {
			let topic = getUniqueString(),
				callback1 = sinon.spy(),
				callback2 = sinon.spy()

			transmitter.subscribe(topic, callback1)
			transmitter.subscribe(topic, callback2)
			let result = transmitter.clearAllSubscriptions()

			assert.isTrue(result)
		})

		it("should return false when unsubscribe a non existing topic", function () {
			let topic = getUniqueString(),
				callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			let result = transmitter.unsubscribe(getUniqueString())

			assert.isFalse(result)
		})

		it("should return true when unsubscribe an existing topic", function () {
			let topic = getUniqueString(),
				callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			let result = transmitter.unsubscribe(topic)

			assert.isTrue(result)
		})

		it("should return false when unsubscribe a non existing token", function () {
			let topic = getUniqueString(),
				callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			let result = transmitter.unsubscribe(getUniqueString())

			assert.isFalse(result)
		})

		it("should return true when unsubscribe an existing token", function () {
			let topic = getUniqueString(),
				callback = sinon.spy()

			let token = transmitter.subscribe(topic, callback)
			let result = transmitter.unsubscribe(token)

			assert.isTrue(result)
		})

		it("should return false when unsubscribe a non existing callback", function () {
			let topic = getUniqueString(),
				callback1 = sinon.spy(),
				callback2 = sinon.spy()

			transmitter.subscribe(topic, callback1)
			let result = transmitter.unsubscribe(callback2)

			assert.isFalse(result)
		})

		it("should return true when unsubscribe an existing callback", function () {
			let topic = getUniqueString(),
				callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			let result = transmitter.unsubscribe(callback)

			assert.isTrue(result)
		})

		it("should remove a callback when unsubscribe a topic", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.unsubscribe(topic)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it("should call a callback for non deleted topic when unsubscribe a topic", function () {
			let topic1 = getUniqueString(),
				topic2 = getUniqueString(),
				callback1 = sinon.spy(),
				callback2 = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic1, callback1)
			transmitter.subscribe(topic2, callback2)
			transmitter.unsubscribe(topic1)
			transmitter.publish(topic1)
			transmitter.publish(topic2)
			clock.tick(1)

			assert.isTrue(callback1.notCalled)
			assert.isTrue(callback2.calledOnce)
			clock.restore()
		})

		it("should remove a callback when unsubscribe a token", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			let token = transmitter.subscribe(topic, callback)
			transmitter.unsubscribe(token)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it("should call another callback for the same topic when unsubscribe a token assigned to that topic", function () {
			let topic = getUniqueString(),
				callback1 = sinon.spy(),
				callback2 = sinon.spy(),
				clock = sinon.useFakeTimers()

			let token = transmitter.subscribe(topic, callback1)
			transmitter.subscribe(topic, callback2)
			transmitter.unsubscribe(token)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback1.notCalled)
			assert.isTrue(callback2.calledOnce)
			clock.restore()
		})

		it("should remove the callback when unsubscribe this callback", function () {
			let topic = getUniqueString(),
				callback = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.unsubscribe(callback)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it("should remove the callback from all topics when unsubscribe this callback", function () {
			let topic1 = getUniqueString(),
				topic2 = getUniqueString(),
				callback1 = sinon.spy(),
				callback2 = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic1, callback1)
			transmitter.subscribe(topic2, callback1)
			transmitter.subscribe(topic2, callback2)
			transmitter.unsubscribe(callback1)
			transmitter.publish(topic1)
			transmitter.publish(topic2)
			clock.tick(1)

			assert.isTrue(callback1.notCalled)
			assert.isTrue(callback2.calledOnce)
			clock.restore()
		})
	})

	describe('different tricks', () => {
		it("should not crash when pubishing two topics and callback from one topic unsubscribe second topic", function () {
			let topic1 = getUniqueString(),
				topic2 = getUniqueString(),
				callback1 = function () {
					transmitter.unsubscribe(topic2)
				},
				callback2 = sinon.spy(),
				callback3 = sinon.spy(),
				clock = sinon.useFakeTimers()

			transmitter.subscribe(topic1, callback1)
			transmitter.subscribe(topic2, callback2)
			transmitter.subscribe(topic2, callback3)
			transmitter.publish(topic1)
			transmitter.publish(topic2)
			clock.tick(1)

			assert.isTrue(callback2.notCalled)
			assert.isTrue(callback3.notCalled)
			clock.restore()
		})
	})
})