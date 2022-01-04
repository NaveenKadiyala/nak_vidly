const express = require('express')
const genreRouter = require('../routes/genres')
const customerRouter = require('../routes/customers')
const moviesRouter = require('../routes/movies')
const rentalsRouter = require('../routes/rentals')
const returnsRouter = require('../routes/returns')
const userRouter = require('../routes/users')
const authRouter = require('../routes/auth')
const error = require('../middleware/error')

module.exports = function (app) {
    // A middleware function for handling JSON object
    app.use(express.json())

    // default/home routing
    app.get('/', (req, res) => {
        res.send('This is a vidly application created by Naveen kadiyala, check the endpoints from github page')
    })

    app.use('/api/genres', genreRouter)

    app.use('/api/customers', customerRouter)

    app.use('/api/movies', moviesRouter)

    app.use('/api/rentals', rentalsRouter)

    app.use('/api/users', userRouter)

    app.use('/api/returns', returnsRouter)

    app.use('/api/auth', authRouter)

    app.use(error)

}