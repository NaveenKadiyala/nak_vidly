const winston = require("winston")
const mongoose = require('mongoose')
const config = require('config')

module.exports = function () {
    const dbUrl = config.get('db')
    mongoose.connect(dbUrl)
        .then(() => winston.info(`Connected to MongoDB on ${dbUrl}...`))
}