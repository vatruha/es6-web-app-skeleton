/*
 * Publish/Subscribe Pattern
 *
 * TODO: add Request/Reply pattern
 */

class Transmitter {
	constructor() {
		this.callbacksMap = new Map();
		this.lastUid = -1;
	}

	subscribe(topic, callback) {
		if (typeof topic !== 'string' || typeof callback !== 'function') {
			return false;
		}

		// topic is not registered yet
		if (!this.callbacksMap.has(topic)) {
			this.callbacksMap.set(topic, new Map());
		}

		const token = 'transmitter_uid_' + String(++this.lastUid);
		this.callbacksMap.get(topic).set(token, callback);

		return token;
	}

	publish(topic, message) {
		if (typeof topic !== 'string') {
			return false;
		}

		if (this._topicHasSubscribers(topic)) {
			setTimeout(() => {
				if (this._topicHasSubscribers(topic)) {
					this._callSubscribers(this.callbacksMap.get(topic), topic, message);
				}
			}, 0);
		}

		return true;
	}

	unsubscribe(value) {
		let result = false;
		const isTopic = typeof value === 'string' && this.callbacksMap.has(value);
		const isToken = !isTopic && typeof value === 'string';
		const isFunction = typeof value === 'function';

		if (isTopic) {
			this.callbacksMap.delete(value);
			return true;
		}

		if (!isToken && !isFunction) {
			return false;
		}

		for (const topicCallbacks of this.callbacksMap.values()) {
			if (isToken && topicCallbacks.has(value)) {
				topicCallbacks.delete(value);
				result = true;
				break;
			}

			if (isFunction) {
				for (const [token, tokenCallback] of topicCallbacks) {
					if (tokenCallback === value) {
						topicCallbacks.delete(token);
						result = true;
					}
				}
			}
		}

		return result;
	}

	clearAllSubscriptions() {
		this.callbacksMap = new Map();
		return true;
	}

	_topicHasSubscribers(topic) {
		return this.callbacksMap.has(topic) && this.callbacksMap.get(topic).size;
	}

	_callSubscribers(subscribers, topic, message) {
		for (const callback of subscribers.values()) {
			try {
				callback(topic, message);
			} catch (e) {
				this._asyncReThrowException(e);
			}
		}
	}

	_asyncReThrowException(e) {
		setTimeout(() => {
			this._triggerException(e);
		}, 0);
	}

	// this code in a separate function to allow cover by unit tests
	_triggerException(e) {
		throw e;
	}
}

const transmitter = new Transmitter();
export {transmitter, Transmitter};
