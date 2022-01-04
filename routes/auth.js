const { User } = require('../models/user')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const lodash = require('lodash')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const validateInput = require('../middleware/validateInput')

router.post('/', validateInput(validate), async (req, res) => {

    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(404).send('No user found with the given EmailID!!')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Wrong password, please try again!!')

    const token = user.generateAuthToken()
    res.send({
        'message': 'Logged In...',
        'token': token
    })
})

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(50).required().email(),
        password: Joi.string().min(5).max(20).required(),
    })
    return schema.validate(req)
}

module.exports = router