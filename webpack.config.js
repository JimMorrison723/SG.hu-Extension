const { resolve } = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')
// TODO: use yarn add -D extract-text-webpack-plugin

const VENDOR = 'chrome'

const helperConfig = {
    src: 'src',
    target: 'dist/' + VENDOR,
    copyIgnore: ['**/*.js', '**/*.json'],
    autoReload: false,
    vendor: 'chrome'
}

const config = {
    context: resolve(__dirname, helperConfig.src),
    // devtool: 'source-map',
    entry: {
        content: './scripts/content.js',
        background: './scripts/background.js'
    },
    output: {
        path: resolve(__dirname, 'dist/' + VENDOR + '/scripts'),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },
    module: {
        rules: [

        ]
    },
    plugins: [
        new CleanPlugin(['dist/' + VENDOR]),
        new CopyPlugin([
            {
                // Copy all files except (.js, .json, _locales)
                from: '**/*',
                ignore: helperConfig.copyIgnore,
                to: resolve(__dirname, helperConfig.target)
            },
            {
                // Copy locales
                from: '_locales/**/*.json',
                to: resolve(__dirname, helperConfig.target)
            },
            {
                // Copy manifest file
                from: 'manifest.json',
                to: resolve(__dirname, helperConfig.target)
            }
        ])
    ]
}

if (['chrome', 'opera'].includes(VENDOR)) {
    config.plugins.push(
        new webpack.ProvidePlugin({
            browser: resolve(__dirname, './node_modules/webextension-polyfill')
        })
    ),
    config.plugins.push(
        new ChromeExtensionReloader({
            reloadPage: true,
            entries: {
                contentScript: 'content',
                background: 'background'
              }
        })
    )
}

config.plugins.push(
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
    })
)

module.exports = config;