const { Rental, validate } = require('../models/rental')
const { Movie } = require('../models/movie')
const { Customer } = require('../models/customer')
const mongoose = require('mongoose')
const Fawn = require('fawn')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const validateInput = require('../middleware/validateInput')

Fawn.init('mongodb://localhost/vidly')

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut')
    res.send(rentals)
})

router.get('/:id', async (req, res) => {
    const movie = await Rental.findById(req.params.id)
    if (!movie) return res.status(404).send('Rental with given ID was not found!!')
    res.send(movie)
})

router.post('/', [auth, validateInput(validate)], async (req, res) => {

    const customer = await Customer.findById(req.body.customerId)
    if (!customer) return res.send(404).send('Invalid Customer')

    const movie = await Movie.findById(req.body.movieId)
    if (!movie) return res.send(404).send('Invalid Movie')

    if (movie.numberInStock === 0) return res.send(400).send('Movie not in stock')

    const rental = new Rental({
        customer: {
            _id: customer.id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie.id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    })

    try {
        await new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run()
        res.send(rental)
    } catch (ex) {
        res.status(500).send('Something Failed')
    }
})

module.exports = router