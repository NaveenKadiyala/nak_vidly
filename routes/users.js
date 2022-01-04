const { User, validate } = require('../models/user')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const lodash = require('lodash')
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')
const validateInput = require('../middleware/validateInput')

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
})

router.post('/', validateInput(validate), async (req, res) => {

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('User already exists with this Email!!')

    user = new User(lodash.pick(req.body, ['name', 'email', 'password']))
    const salt = await bcrypt.genSalt()
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()

    const token = user.generateAuthToken()
    res.header('x-auth-token', token).send(lodash.pick(user, ['_id', 'name', 'email']))
})

module.exports = router