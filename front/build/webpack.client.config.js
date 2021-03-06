const webpack = require('webpack')
const base = require('./webpack.base.config')
const vueConfig = require('./vue-loader.config')
const utils = require('./utils')
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')

const config = Object.assign({}, base, {
  resolve: {
    alias: Object.assign({}, base.resolve.alias, {
      'create-api': './create-api-client.js'
    }),
    extensions: base.resolve.extensions
  },
  plugins: (base.plugins || []).concat([
    // strip comments in Vue code
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"',
      'process.BROWSER': true
    }),
    // generate output HTML
    new HTMLPlugin({
      template: 'src/index.template.html'
    })
  ])
})

if (process.env.NODE_ENV === 'production') {
  // Use ExtractTextPlugin to extract CSS into a single file
  // so it's applied on initial render.
  vueConfig.loaders = utils.cssLoaders({
    extract: true
  })

  config.plugins.push(
    new ExtractTextPlugin('styles.css'),
    // this is needed in webpack 2 for minifying CSS
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    // minify JS
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    new SWPrecachePlugin({
      cacheId: 'blog',
      filename: 'service-worker.js',
      minify: true,
      mergeStaticsConfig: true,
      staticFileGlobs: [
        path.join(__dirname, '../dist/static/*.*')
      ],
      stripPrefixMulti: {
        [path.join(__dirname, '../dist/static')]: '/static'
      },
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [
        /index\.html$/,
        /\.map$/,
        /\.css$/,
        /\.svg$/,
        /\.eot$/
      ]
    })
  )
}

module.exports = config
