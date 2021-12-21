# VideoSync
A class for syncing the playback of one or more video elements.

<a href="http://alexanderspirgel.com/video-sync/demo" target="_blank">View the demo →</a>

## Installation

### Using NPM:

```js
npm install @alexspirgel/video-sync
```

```js
const VideoSync = require('@alexspirgel/video-sync');
```

### Using a script tag:

Download the normal or minified script from the `/dist` folder.

```html
<script src="path/to/video-sync.js"></script>
```

## Usage

```js
const videoSync = new VideoSync({
	syncedVideoElements: '.video'
});
```

## Options

### `syncedVideoElements`

The video elements to sync.

### `primarySyncedVideoElement`

Manually set a primary video element. The primary video element is what the other video elements sync to. If left unset, a one of the `syncedVideoElements` will be chosen automatically.

### `syncFrequency`

The frequency (in milliseconds) to update the playback rate of the video when actively syncing playback. If left unset, a default value of 250 will be used.

### `minimumPlaybackRate`

The minimum playback rate to be set when syncing the playback of the videos. If left unset a value of 0.33 will be used.

### `maximumPlaybackRate`

The maximum playback rate to be set when syncing the playback of the videos. If left unset a value of 3.00 will be used.

### `debug`

If true, helpful debugging messages will be logged to the console. Defaults to false.