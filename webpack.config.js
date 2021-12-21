const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const packageData = require('./package.json');

module.exports = [
	{
		mode: 'production',
		name: 'VideoSync',
		entry: './src/video-sync.js',
		target: 'web',
		output: {
			library: 'VideoSync',
			libraryTarget: 'var',
			filename: 'video-sync.js',
			path: path.resolve(__dirname, './dist')
		},
		plugins: [
			new webpack.BannerPlugin({
				banner: `VideoSync v${packageData.version}\nhttps://github.com/alexspirgel/video-sync`
			})
		],
		optimization: {
			minimize: false
		},
		watch: true
	},
	{
		mode: 'production',
		name: 'VideoSync',
		entry: './src/video-sync.js',
		target: 'web',
		output: {
			library: 'VideoSync',
			libraryTarget: 'var',
			filename: 'video-sync.min.js',
			path: path.resolve(__dirname, './dist')
		},
		plugins: [
			new webpack.BannerPlugin({
				banner: `VideoSync v${packageData.version}\nhttps://github.com/alexspirgel/video-sync`
			})
		],
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					terserOptions: {
						keep_classnames: true
					}
				})
			]
		},
		watch: true
	}
];