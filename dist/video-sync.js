/*!
 * VideoSync v1.0.0
 * https://github.com/alexspirgel/video-sync
 */
var VideoSync;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 683:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const isPlainObject = __webpack_require__(605);

function isElement(value) {
	if (typeof value === 'object' &&
	value !== null &&
	value.nodeType === 1 &&
	!isPlainObject(value)) {
		return true;
	}
	return false;
}

module.exports = isElement;

/***/ }),

/***/ 605:
/***/ ((module) => {

function isPlainObject(value) {
	if (typeof value !== 'object' ||
	value === null ||
	Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}
	if (Object.getPrototypeOf(value) === null) {
    return true;
  }
	let prototype = value;
  while (Object.getPrototypeOf(prototype) !== null) {
    prototype = Object.getPrototypeOf(prototype);
  }
  return Object.getPrototypeOf(value) === prototype;
}

module.exports = isPlainObject;

/***/ }),

/***/ 364:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const isElement = __webpack_require__(683);

function normalizeElements(inputValue, elementsSet = new Set()) {
	if (Array.isArray(inputValue) || inputValue instanceof NodeList) {
		for (let value of inputValue) {
			normalizeElements(value, elementsSet);
		}
	}
	else if (typeof inputValue === 'string') {
		let elements = document.querySelectorAll(inputValue);
		normalizeElements(elements, elementsSet);
	}
	else if (isElement(inputValue)) {
		elementsSet.add(inputValue);
	}
	const optionElements = Array.from(elementsSet);
	return optionElements;
}

module.exports = normalizeElements;

/***/ }),

/***/ 946:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const normalizeElements = __webpack_require__(364);

class VideoSync {

	static isVideoElement(element) {
		if (HTMLVideoElement && element instanceof HTMLVideoElement) {
			return true;
		}
		else if (element.tagName === 'VIDEO') {
			return true;
		}
		else {
			return false;
		}
	}

	constructor(options) {		
		this.syncedVideoElements = options.syncedVideoElements;
		if (options.primarySyncedVideoElement !== null && options.primarySyncedVideoElement !== undefined) {
			this.primarySyncedVideoElement = options.primarySyncedVideoElement;
		}
		this.syncFrequency = options.syncFrequency;
		this.minimumPlaybackRate = options.minimumPlaybackRate;
		this.maximumPlaybackRate = options.maximumPlaybackRate;
		this.debug = options.debug;

		this.debugMessage(this);
	}

	set primarySyncedVideoElement(element) {
		if (element === null || element === undefined) {
			if (this.primarySyncedVideoElement) {
				this.removePrimaryVideoElementEventListeners(this.primarySyncedVideoElement);
			}
			this.stopPlaybackRateSync();
			this._primarySyncedVideoElement = element;
			this.debugMessage(`'primarySyncedVideoElement' has been removed.`);
			return this.primarySyncedVideoElement;
		}
		const normalizedElements = normalizeElements(element);
		const firstNormalizedElement = normalizedElements[0];
		if (this.syncedVideoElements.includes(firstNormalizedElement)) {
			if (this.primarySyncedVideoElement) {
				this.removePrimaryVideoElementEventListeners(this.primarySyncedVideoElement);
			}
			this._primarySyncedVideoElement = firstNormalizedElement;
			this.addPrimaryVideoElementEventListeners(firstNormalizedElement);
			this.debugMessage(`Added 'primarySyncedVideoElement': `, this.primarySyncedVideoElement);
			return this.primarySyncedVideoElement;
		}
		else {
			throw new Error(`'primarySyncedVideoElement' must be one of the 'syncedVideoElements' or 'null'.`);
		}
	}

	get primarySyncedVideoElement() {
		return this._primarySyncedVideoElement;
	}

	set syncedVideoElements(elements) {
		const normalizedElements = normalizeElements(elements);
		this._syncedVideoElements = [];
		this.primarySyncedVideoElement = null;
		if (normalizedElements.length > 0) {
			for (const normalizedElement of normalizedElements) {
				this.addSyncedVideoElement(normalizedElement);
			}
		}
		else {
			this.debugMessage('No elements found to add.');
		}
	}

	get syncedVideoElements() {
		if (Array.isArray(this._syncedVideoElements)) {
			return this._syncedVideoElements;
		}
		else {
			return [];
		}
	}

	addSyncedVideoElement(element) {
		const normalizedElements = normalizeElements(element);
		const firstNormalizedElement = normalizedElements[0];
		if (firstNormalizedElement && this.constructor.isVideoElement(firstNormalizedElement)) {
			const syncedVideoElementIndex = this.syncedVideoElements.indexOf(firstNormalizedElement);
			if (syncedVideoElementIndex >= 0) {
				this.debugMessage('Element is already a synced video element, it cannot be added twice.');
				return null;
			}
			else {
				this.debugMessage('Adding synced video element: ', firstNormalizedElement);
				this.syncedVideoElements.push(firstNormalizedElement);
				if (!this.primarySyncedVideoElement) {
					this.debugMessage(`'primarySyncedVideoElement' is not set, the newly added synced video element will be set as 'primarySyncedVideoElement'.`);
					this.primarySyncedVideoElement = firstNormalizedElement;
				}
				return firstNormalizedElement;
			}
		}
		throw new Error(`Argument must be a video element.`);
	}

	removeSyncedVideoElement(element) {
		const normalizedElements = normalizeElements(element);
		const firstNormalizedElement = normalizedElements[0];
		if (firstNormalizedElement && this.constructor.isVideoElement(firstNormalizedElement)) {
			const syncedVideoElementIndex = this.syncedVideoElements.indexOf(firstNormalizedElement);
			if (syncedVideoElementIndex >= 0) {
				this.debugMessage('Removing synced video element: ', firstNormalizedElement);
				this.syncedVideoElements.splice(syncedVideoElementIndex, 1);
				if (this.primarySyncedVideoElement === firstNormalizedElement) {
					this.primarySyncedVideoElement = null;
					this.debugMessage(`Attempting to set new 'primarySyncedVideoElement'...'`);
					if (this.syncedVideoElements.length > 0) {
						this.primarySyncedVideoElement = this.syncedVideoElements[0];
					}
					else {
						this.debugMessage(`There are no remaining 'syncedVideoElements' to set as primary.`);
					}
				}
				return firstNormalizedElement;
			}
			else {
				this.debugMessage('Did not find matching synced video element to remove.');
				return null;
			}
		}
		throw new Error(`Argument must be a video element.`);
	}

	set syncFrequency(milliseconds) {
		if (milliseconds === null || milliseconds === undefined) {
			milliseconds = 250;
		}
		if (typeof milliseconds === 'number') {
			if (milliseconds > 0) {
				this._syncFrequency = milliseconds;
				return this.syncFrequency;
			}
		}
		throw new Error(`'syncFrequency' must be a number larger than zero.`);
	}

	get syncFrequency() {
		return this._syncFrequency;
	}

	set minimumPlaybackRate(rate) {
		if (rate === null || rate === undefined) {
			rate = 0.33;
		}
		if (typeof rate === 'number') {
			if (rate > 0) {
				this._minimumPlaybackRate = rate;
				return this.minimumPlaybackRate;
			}
		}
		throw new Error(`'minimumPlaybackRate' must be a number larger than zero.`);
	}

	get minimumPlaybackRate() {
		return this._minimumPlaybackRate;
	}

	set maximumPlaybackRate(rate) {
		if (rate === null || rate === undefined) {
			rate = 3.00;
		}
		if (typeof rate === 'number') {
			if (rate > 0) {
				this._maximumPlaybackRate = rate;
				return this.maximumPlaybackRate;
			}
		}
		else {
			this._maximumPlaybackRate = 3.00; // default
		}
	}

	get maximumPlaybackRate() {
		return this._maximumPlaybackRate;
	}

	play(skipElement) {
		this.startPlaybackRateSync();
		for (let i = 0; i < this.syncedVideoElements.length; i++) {
			const thisSyncedVideoElement = this.syncedVideoElements[i];
			if (thisSyncedVideoElement !== skipElement) {
				this.debugMessage('play', thisSyncedVideoElement);
				thisSyncedVideoElement.play();
			}
		}
	}

	pause(skipElement) {
		for (let i = 0; i < this.syncedVideoElements.length; i++) {
			const thisSyncedVideoElement = this.syncedVideoElements[i];
			if (thisSyncedVideoElement !== skipElement) {
				this.debugMessage('pause', thisSyncedVideoElement);
				thisSyncedVideoElement.pause();
			}
		}
		this.stopPlaybackRateSync();
	}

	currentTime(time, skipElement) {
		for (let i = 0; i < this.syncedVideoElements.length; i++) {
			const thisSyncedVideoElement = this.syncedVideoElements[i];
			if (thisSyncedVideoElement !== skipElement) {
				this.debugMessage('currentTime()', time, thisSyncedVideoElement);
				thisSyncedVideoElement.currentTime = time;
			}
		}
	}

	playbackRate(rate, skipElement) {
		for (let i = 0; i < this.syncedVideoElements.length; i++) {
			const thisSyncedVideoElement = this.syncedVideoElements[i];
			if (thisSyncedVideoElement !== skipElement) {
				this.debugMessage('playbackRate', rate, thisSyncedVideoElement);
				thisSyncedVideoElement.playbackRate = rate;
			}
		}
	}

	addPrimaryVideoElementEventListeners(element) {
		element.addEventListener('play', this.primaryVideoElementPlayHandler);
		element.addEventListener('pause', this.primaryVideoElementPauseHandler);
		element.addEventListener('seeked', this.primaryVideoElementSeekedHandler);
	}
	
	removePrimaryVideoElementEventListeners(element) {
		element.removeEventListener('play', this.primaryVideoElementPlayHandler);
		element.removeEventListener('pause', this.primaryVideoElementPauseHandler);
		element.removeEventListener('seeked', this.primaryVideoElementSeekedHandler);
	}

	primaryVideoElementPlayHandler = (event) => {
		this.debugMessage('primaryVideoElementPlayHandler', event);
		if (this.ignoreNextEventList['play'] && this.ignoreNextEventList['play'].includes(event.target)) {
			this.debugMessage('primaryVideoElementPlayHandler CANCELLED');
			this.removeIgnoreNextEvent('play', event.target);
			return;
		}
		this.play(event.target);
	}

	primaryVideoElementPauseHandler = (event) => {
		this.debugMessage('primaryVideoElementPauseHandler', event);
		if (this.ignoreNextEventList['pause'] && this.ignoreNextEventList['pause'].includes(event.target)) {
			this.debugMessage('primaryVideoElementPauseHandler CANCELLED');
			this.removeIgnoreNextEvent('pause', event.target);
			return;
		}
		this.pause(event.target);
	}

	primaryVideoElementSeekedHandler = (event) => {
		this.debugMessage('primaryVideoElementSeekedHandler', event);
		if (this.ignoreNextEventList['seeked'] && this.ignoreNextEventList['seeked'].includes(event.target)) {
			this.debugMessage('primaryVideoElementSeekedHandler CANCELLED');
			this.removeIgnoreNextEvent('seeked', event.target);
			return;
		}
		this.currentTime(event.target.currentTime, event.target);
	}

	get ignoreNextEventList() {
		if (!this._ignoreNextEventList) {
			this._ignoreNextEventList = {};
		}
		return this._ignoreNextEventList;
	}

	addIgnoreNextEvent(eventName, element) {
		if (!this.ignoreNextEventList[eventName]) {
			this.ignoreNextEventList[eventName] = [];
		}
		if (!this.ignoreNextEventList[eventName].includes(element)) {
			this.ignoreNextEventList[eventName].push(element);
		}
	}

	removeIgnoreNextEvent(eventName, element) {
		if (this.ignoreNextEventList[eventName]) {
			const elementIndex = this.ignoreNextEventList[eventName].indexOf(element);
			if (elementIndex >= 0) {
				this.ignoreNextEventList[eventName].splice(elementIndex, 1);
			}
		}
	}

	forceExactPlaybackSync() {
		if (!this.primarySyncedVideoElement) {
			this.debugMessage(`Must have a 'primarySyncedVideoElement' to force exact playback sync.`);
			return;
		}
		if (this.syncedVideoElements.length < 2) {
			this.debugMessage(`Must have a at least 2 'syncedVideoElements' to force exact playback sync.`);
			return;
		}
		if (this.primarySyncedVideoElement) {
			this.currentTime(this.primarySyncedVideoElement.currentTime, this.primarySyncedVideoElement);
			this.playbackRate(this.primarySyncedVideoElement.playbackRate, this.primarySyncedVideoElement);
		}
	}

	startPlaybackRateSync() {
		if (this.playbackRateSyncLoop) {
			this.debugMessage(`Playback rate sync loop has already started.`);
			return;
		}
		if (this.syncedVideoElements.length < 2) {
			this.debugMessage(`Must have a at least 2 'syncedVideoElements' to start playback rate syncing.`);
			return;
		}
		this.forceExactPlaybackSync();
		if (this.playbackRateSyncLoop) {
			clearInterval(this.playbackRateSyncLoop);
		}
		this.playbackRateSyncLoop = setInterval(this.playbackRateSyncTick, this.syncFrequency);
		this.debugMessage(`Started playback rate syncing.`);
	}

	playbackRateSyncTick = () => {
		if (!this.primarySyncedVideoElement) {
			this.debugMessage(`No 'primarySyncedVideoElement', stopping playback rate sync.`);
			this.stopPlaybackRateSync();
			return;
		}
		for (let i = 0; i < this.syncedVideoElements.length; i++) {
			const thisSyncedVideoElement = this.syncedVideoElements[i];
			if (thisSyncedVideoElement !== this.primarySyncedVideoElement) {
				const currentTimeDifference = this.primarySyncedVideoElement.currentTime - thisSyncedVideoElement.currentTime;
				let compensatingPlaybackRate = ((Math.min(Math.max((currentTimeDifference / 2 + 1), this.minimumPlaybackRate), this.maximumPlaybackRate))).toFixed(2);
				if (compensatingPlaybackRate > .99 && compensatingPlaybackRate < 1.01) {
					this.debugMessage('Video playback rate in sync with primary.', thisSyncedVideoElement);
					compensatingPlaybackRate = 1.00;
				}
				else {
					this.debugMessage(`Video new playback rate: ${compensatingPlaybackRate}.`, thisSyncedVideoElement);
					thisSyncedVideoElement.playbackRate = compensatingPlaybackRate;
				}
			}
		}
	}

	stopPlaybackRateSync() {
		if (!this.playbackRateSyncLoop) {
			this.debugMessage(`Playback rate syncing has already stopped.`);
			return;
		}
		if (this.playbackRateSyncLoop) {
			clearInterval(this.playbackRateSyncLoop);
			this.playbackRateSyncLoop = null;
		}
		this.debugMessage(`Stopped playback rate syncing.`);
	}

	debugMessage(...messages) {
		if (this.debug) {
			console.log('VideoSync debug:', ...messages);
		}
	}

}

module.exports = VideoSync;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(946);
/******/ 	VideoSync = __webpack_exports__;
/******/ 	
/******/ })()
;