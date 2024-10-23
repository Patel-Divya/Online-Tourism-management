const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    tripID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips',
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        require: true
    },
    cart: {
        type: [itemSchema],
        require: false
    }
});

const passengerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: false
    },
    age: {
        type: Number,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
})

const savedBookingDetails = new mongoose.Schema({
    tripID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips',
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        require: true
    },
    passengers: {
        type: [passengerSchema],
        require: false,
        default: null
    }
});

const bookingDetails = new mongoose.model('savedBookingDetails', savedBookingDetails, 'savedBookingDetails')

const Cart = new mongoose.model('carts', cartSchema, 'carts');

module.exports = {Cart, bookingDetails};