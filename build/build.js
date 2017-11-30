process.env.NODE_ENV = 'production'

const rm = require('rimraf')
const config = require('../config')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.prod')
const chalk = require('chalk')

const ora = require('ora')
const spinner = ora('building for production...')
spinner.start()

webpack(webpackConfig, function (err, status) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(status.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n')

    if (status.hasErrors()) {
        console.log(chalk.red('  Build failed with errors.\n'))
        process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
})
