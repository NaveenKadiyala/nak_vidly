const { Genre, validate } = require('../models/genre')
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validateObjectId = require('../middleware/validateObjectId')
const validateInput = require('../middleware/validateInput')

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort('name')
    res.send(genres)
})

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id)
    if (!genre) {
        res.status(404).send('The genre with given ID was not found!!')
        return
    }
    res.send(genre)
})

router.post('/', [auth, validateInput(validate)], async (req, res) => {
    let genre = new Genre({ name: req.body.name })
    genre = await genre.save()
    res.send(genre)
})

router.put('/:id', [auth, validateObjectId, validateInput(validate)], async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })
    if (!genre) {
        res.status(404).send('The genre with given ID was not found!!')
        return
    }
    res.send(genre)
})

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)
    if (!genre) {
        res.status(404).send('The genre with given ID was not found!!')
        return
    }
    res.send(genre)
})

module.exports = router