const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '../../dist/client'),
        },
        hot: true,
        port: 10206,
        proxy: {
            '/socket.io' : {
                target: 'http://localhost:3000',
                we: true
            }
        }
    },
})