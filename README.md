# Video Sync
A class for syncing the playback of one or more video elements.

## Installation

### Using NPM:

```js
npm install @alexspirgel/video-sync
```

```js
const VideoSync = require('@alexspirgel/video-sync');
```

## Usage

```js
const videoSync = new VideoSync({
	primaryVideoElement: '.primary-video',
	secondaryVideoElements: '.secondary-video',
	syncFrequency: 250,
	minimumPlaybackRate: 0.33,
	maximumPlaybackRate: 3.00,
	debug: false,
});
videoSync.play();
```