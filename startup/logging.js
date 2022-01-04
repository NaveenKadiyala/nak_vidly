require('express-async-errors')
const winston = require('winston')
require('winston-mongodb')
const config = require('config')

module.exports = function () {

    // here we are handling the uncaught exceptions from any place.
    /* process.on('uncaughtException', (ex) => {
        console.log('We got an uncaught excpetion at startUp!!')
        winston.error(ex.message, ex)
        process.exit(1) // it is better to terminate the process after getting some issues.
    })
    */

    // this is a helper function available for above case in the winston library.
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: 'exceptions.log', prettyPrint: true }))

    process.on('unhandledRejection', (ex) => {
        throw Error(ex)
        // console.log('We got an unhandledRejection at some place!!')
        // winston.error(ex.message, ex)
    })

    winston.add(new winston.transports.File({ filename: 'logfile.log' }))
    winston.add(new winston.transports.Console())
    winston.add(new winston.transports.MongoDB({
        db: config.get('db'),
        options: { useUnifiedTopology: true },
        collection: 'server_logs'
    }))

    // throw new Error('An unacought exception from the node enviroment')
}