const Joi = require('joi')
const mongoose = require('mongoose')

// creating database schema
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 15
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: true,
        length: 10
    }
})

const Customer = mongoose.model('Customer', customerSchema)

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().length(10).required(),
        isGold: Joi.boolean()
    })
    return schema.validate(customer)
}

exports.Customer = Customer
exports.validate = validateCustomer