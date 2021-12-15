const normalizeElements = require('@alexspirgel/normalize-elements');

class VideoSync {

	static isVideoPlaying(video) {
		if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2) {
			return true;
		}
		else {
			return false;
		}
	}

	constructor(options) {
		this.primaryVideoElement = options.primaryVideoElement;
		this.secondaryVideoElements = options.secondaryVideoElements;
		this.syncFrequency = options.syncFrequency;
		this.minimumPlaybackRate = options.minimumPlaybackRate;
		this.maximumPlaybackRate = options.maximumPlaybackRate;
		this._debug = options.debug;

		this.startSync();
		this.debug(this);
	}

	get primaryVideoElement() {
		return this._primaryVideoElement;
	}

	set primaryVideoElement(element) {
		const normalizedElements = normalizeElements(element);
		if (normalizedElements.length > 0) {
			this._primaryVideoElement = normalizedElements[0];
		}
		else {
			throw new Error('No primary video found.');
		}
	}

	get secondaryVideoElements() {
		if (this._secondaryVideoElements) {
			return this._secondaryVideoElements;
		}
		else {
			return [];
		}
	}

	set secondaryVideoElements(elements) {
		const normalizedElements = normalizeElements(elements);
		this._secondaryVideoElements = normalizedElements;
	}

	get syncFrequency() {
		return this._syncFrequency;
	}

	set syncFrequency(miliseconds) {
		if (typeof miliseconds === 'number') {
			if (miliseconds <= 0) {
				throw new Error(`'syncFrequency' must be a number larger than zero.`);
			}
			this._syncFrequency = miliseconds;
		}
		else {
			this._syncFrequency = 250; // default
		}
	}

	get minimumPlaybackRate() {
		return this._minimumPlaybackRate;
	}

	set minimumPlaybackRate(rate) {
		if (typeof rate === 'number') {
			this._minimumPlaybackRate = rate;
		}
		else {
			this._minimumPlaybackRate = 0.33; // default
		}
	}

	get maximumPlaybackRate() {
		return this._maximumPlaybackRate;
	}

	set maximumPlaybackRate(rate) {
		if (typeof rate === 'number') {
			this._maximumPlaybackRate = rate;
		}
		else {
			this._maximumPlaybackRate = 3.00; // default
		}
	}

	startSync() {
		if (!this.syncLoop) {
			this.syncLoop = setInterval(() => {
				if (this.constructor.isVideoPlaying(this.primaryVideoElement)) {
					for (let i = 0; i < this.secondaryVideoElements.length; i++) {
						const secondaryVideoElement = this.secondaryVideoElements[i];
						const timeDifference = this.primaryVideoElement.currentTime - secondaryVideoElement.currentTime;
						let compensatingPlaybackRate = ((Math.min(Math.max((timeDifference / 2 + 1), this.minimumPlaybackRate), this.maximumPlaybackRate))).toFixed(2);
						if (compensatingPlaybackRate > .99 && compensatingPlaybackRate < 1.01) {
							this.debug('in sync');
							compensatingPlaybackRate = 1.00;
						}
						else {
							this.debug(`new playback rate: ${compensatingPlaybackRate}`);
						}
						secondaryVideoElement.playbackRate = compensatingPlaybackRate;
					}
				}
				else {
					this.forceSync();
					this.debug('primary video not playing, force exact sync');
				}
			}, this.syncFrequency);
			this.debug('start sync');
		}
		this.debug('sync already started');
	}

	stopSync() {
		if (this.syncLoop) {
			clearInterval(this.syncLoop);
			this.syncLoop = null;
			this.debug('stop sync');
		}
	}

	forceSync() {
		for (let i = 0; i < this.secondaryVideoElements.length; i++) {
			const secondaryVideoElement = this.secondaryVideoElements[i];
			secondaryVideoElement.currentTime = this.primaryVideoElement.currentTime;
			secondaryVideoElement.playbackRate = this.primaryVideoElement.playbackRate;
		}
	}

	play() {
		this.forceSync();
		this.startSync();
		this.primaryVideoElement.play();
		for (let i = 0; i < this.secondaryVideoElements.length; i++) {
			const secondaryVideoElement = this.secondaryVideoElements[i];
			secondaryVideoElement.play();
		}
	}

	pause() {
		this.primaryVideoElement.pause();
		for (let i = 0; i < this.secondaryVideoElements.length; i++) {
			const secondaryVideoElement = this.secondaryVideoElements[i];
			secondaryVideoElement.pause();
		}
		this.stopSync();
		this.forceSync();
	}

	debug(...messages) {
		if (this._debug) {
			console.log('VideoSync Debug:', ...messages);
		}
	}

}

module.exports = VideoSync;