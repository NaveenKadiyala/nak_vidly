const { Customer, validate } = require('../models/customer')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const validateInput = require('../middleware/validateInput')

router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name')
    res.send(customers)
})

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
        res.status(404).send('Customer with given ID was not found!!')
        return
    }
    res.send(customer)
})

router.post('/', [auth, validateInput(validate)], async (req, res) => {
    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    })
    await customer.save()
    res.send(customer)
})

router.put('/:id', [auth, validateInput(validate)], async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    }, { new: true })
    if (!customer) {
        res.status(404).send('The Customer with given ID was not found!!')
        return
    }
    res.send(customer)
})

router.delete('/:id', auth, async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id)
    if (!customer) {
        res.status(404).send('The Customer with given ID was not found!!')
        return
    }
    res.send(customer)
})

module.exports = router