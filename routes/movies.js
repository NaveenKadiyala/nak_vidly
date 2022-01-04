const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const { Movie, validate } = require('../models/movie')
const { Genre } = require('../models/genre')
const auth = require('../middleware/auth')
const validateInput = require('../middleware/validateInput')

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('title')
    res.send(movies)
})

router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id)
    if (!movie) {
        res.status(404).send('Movie with given ID was not found!!')
        return
    }
    res.send(movie)
})

router.post('/', [auth, validateInput(validate)], async (req, res) => {
    
    const genre = await Genre.findById(req.body.genreId)
    if (!genre) return res.send(404).send('Invalid Genre')

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre.id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })
    await movie.save()
    res.send(movie)
})

router.put('/:id', [auth, validateInput(validate)], async (req, res) => {

    const genre = await Genre.findById(req.body.genreId)
    if (!genre) return res.send(404).send('Invalid Genre')

    const movie = await Movie.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        genre: {
            _id: genre.id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, { new: true })

    if (!movie) return res.status(404).send('The Movie with given ID was not found!!')

    res.send(movie)
})

router.delete('/:id', auth, async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id)
    if (!movie) return res.status(404).send('The Movie with given ID was not found!!')
    res.send(movie)
})

module.exports = router