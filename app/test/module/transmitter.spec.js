import {Transmitter} from '/module/transmitter/transmitter.js'
import helpers from '/module/helpers/helpers.js'
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

	return `Unique string ${getUniqueString.uid.toString()}`
}

/**
 * Make sure that all tokens in the passed array are different
 * @param tokens
 */
function assertAllTokensDifferent(tokens) {
	const length = tokens.length

	assert.isAbove(length, 0)

	// compare all tokens
	for (let i = 0; i < length; i++) {
		for (let j = i + 1; j < length; j++) {
			assert.notEqual(tokens[i], tokens[j])
		}
	}
}

describe('Transmitter', () => {
	beforeEach(() => {
		transmitter = new Transmitter()
	})

	afterEach(() => {
		transmitter = null
	})

	describe('subscribe()', () => {
		it('should return token as String', () => {
			const callback = sinon.spy()
			assert.isString(transmitter.subscribe(getUniqueString(), callback))
		})

		it('should return false when a subscriber is not a function', () => {
			const topic = getUniqueString()
			const invalidSubscribers = [undefined, null, 'a string', 123, [], {}, new Date()]

			invalidSubscribers.forEach((callback) => {
				assert.isFalse(transmitter.subscribe(topic, callback))
			})
		})

		it('should return false when a topic is not a string', () => {
			const callback = sinon.spy()
			const invalidTopics = [undefined, null, 123, [], {}, new Date()]

			invalidTopics.forEach((topic) => {
				assert.isFalse(transmitter.subscribe(topic, callback))
			})
		})

		it('should return unique tokens for several subscriptions with the same callback', () => {
			const tokens = []
			const callback = sinon.spy()

			for (let i = 0; i < 10; i++) {
				tokens.push(transmitter.subscribe(getUniqueString(), callback))
			}

			assertAllTokensDifferent(tokens)
		})

		it('should return unique tokens for different subscribers', () => {
			const topic = getUniqueString()
			const tokens = []
			const getCallback = value => {
				return () => value
			}

			for (let i = 0; i < 10; i++) {
				tokens.push(transmitter.subscribe(topic, getCallback(i)))
			}

			assertAllTokensDifferent(tokens)
		})
	})

	describe('publish()', () => {
		it('should return false when a topic is not a string', () => {
			const invalidTopics = [undefined, null, 123, [], {}, new Date()]

			invalidTopics.forEach((topic) => {
				assert.isFalse(transmitter.publish(topic, getUniqueString()))
			})
		})

		it('should return true when publishing', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()

			transmitter.subscribe(topic, callback)

			assert.isTrue(transmitter.publish(topic, getUniqueString()))
		})

		it('should call callback async when publishing', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)

			transmitter.publish(topic, getUniqueString())
			assert.isTrue(callback.notCalled)

			clock.tick(1)
			assert.isTrue(callback.calledOnce)
			clock.restore()
		})

		it('should pass a correct message into a callback and call it when publishing', () => {
			const topic = getUniqueString()
			const message = {'q': getUniqueString(), 'w': getUniqueString()}
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.publish(topic, message)
			clock.tick(1)

			assert.isTrue(callback.calledOnce)
			assert.deepEqual(callback.args[0], [topic, message])
			clock.restore()
		})

		it('should return true when publishing without subscribers assigned to that topic', () => {
			const callback = sinon.spy()

			transmitter.subscribe(getUniqueString(), callback)
			assert.isTrue(transmitter.publish(getUniqueString(), getUniqueString()))
		})

		it('should call the same callback several times when publishing a message to the same topic several times', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.publish(topic, getUniqueString())
			transmitter.publish(topic, getUniqueString())
			transmitter.publish(topic, getUniqueString())
			clock.tick(1)

			assert.isTrue(callback.calledThrice)
			clock.restore()
		})

		it('after clearing of all subscriptions should return true when publishing', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.clearAllSubscriptions()
			assert.isTrue(transmitter.publish(topic, getUniqueString()))
			clock.restore()
		})

		it('after clearing of all subscriptions should not call a callback when publishing', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.clearAllSubscriptions()
			transmitter.publish(topic, getUniqueString())
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it('should call all subscribers, even if there are exceptions', async () => {
			const topic = getUniqueString()
			const callbackInException = sinon.spy()
			const stub = sinon.stub(transmitter, '_triggerException').callsFake(callbackInException)
			const callback1 = () => {
				throw new Error('some error')
			}
			const callback2 = sinon.spy()
			const callback3 = sinon.spy()

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
		it('should return true when unsubscribe all', () => {
			const topic = getUniqueString()
			const callback1 = sinon.spy()
			const callback2 = sinon.spy()

			transmitter.subscribe(topic, callback1)
			transmitter.subscribe(topic, callback2)
			const result = transmitter.clearAllSubscriptions()

			assert.isTrue(result)
		})

		it('should return false when unsubscribe a non existing topic', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			const result = transmitter.unsubscribe(getUniqueString())

			assert.isFalse(result)
		})

		it('should return true when unsubscribe an existing topic', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			const result = transmitter.unsubscribe(topic)

			assert.isTrue(result)
		})

		it('should return false when unsubscribe a non existing token', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			const result = transmitter.unsubscribe(getUniqueString())

			assert.isFalse(result)
		})

		it('should return true when unsubscribe an existing token', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()

			const token = transmitter.subscribe(topic, callback)
			const result = transmitter.unsubscribe(token)

			assert.isTrue(result)
		})

		it('should return false when unsubscribe a non existing callback', () => {
			const topic = getUniqueString()
			const callback1 = sinon.spy()
			const callback2 = sinon.spy()

			transmitter.subscribe(topic, callback1)
			const result = transmitter.unsubscribe(callback2)

			assert.isFalse(result)
		})

		it('should return true when unsubscribe an existing callback', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()

			transmitter.subscribe(topic, callback)
			const result = transmitter.unsubscribe(callback)

			assert.isTrue(result)
		})

		it('should remove a callback when unsubscribe a topic', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.unsubscribe(topic)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it('should call a callback for non deleted topic when unsubscribe a topic', () => {
			const topic1 = getUniqueString()
			const topic2 = getUniqueString()
			const callback1 = sinon.spy()
			const callback2 = sinon.spy()
			const clock = sinon.useFakeTimers()

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

		it('should remove a callback when unsubscribe a token', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			const token = transmitter.subscribe(topic, callback)
			transmitter.unsubscribe(token)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it('should call another callback for the same topic when unsubscribe a token assigned to that topic', () => {
			const topic = getUniqueString()
			const callback1 = sinon.spy()
			const callback2 = sinon.spy()
			const clock = sinon.useFakeTimers()

			const token = transmitter.subscribe(topic, callback1)
			transmitter.subscribe(topic, callback2)
			transmitter.unsubscribe(token)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback1.notCalled)
			assert.isTrue(callback2.calledOnce)
			clock.restore()
		})

		it('should remove the callback when unsubscribe this callback', () => {
			const topic = getUniqueString()
			const callback = sinon.spy()
			const clock = sinon.useFakeTimers()

			transmitter.subscribe(topic, callback)
			transmitter.unsubscribe(callback)
			transmitter.publish(topic)
			clock.tick(1)

			assert.isTrue(callback.notCalled)
			clock.restore()
		})

		it('should remove the callback from all topics when unsubscribe this callback', () => {
			const topic1 = getUniqueString()
			const topic2 = getUniqueString()
			const callback1 = sinon.spy()
			const callback2 = sinon.spy()
			const clock = sinon.useFakeTimers()

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
		it('should not crash when pubishing two topics and callback from one topic unsubscribe second topic', () => {
			const topic1 = getUniqueString()
			const topic2 = getUniqueString()
			const callback1 = () => {
				transmitter.unsubscribe(topic2)
			}
			const callback2 = sinon.spy()
			const callback3 = sinon.spy()
			const clock = sinon.useFakeTimers()

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
