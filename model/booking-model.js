const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
})

const BookingSchema = new mongoose.Schema({
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
    email: {
        type: String,
        ref: 'customers',
        require: true
    },
    phone: {
        type: Number,
        ref: 'customers',
        require: true
    },
    passengers: {
        type: [passengerSchema],
        require: false,
        default: null
    },
    isConfirmed: {
        type: Boolean,
        default: false
    }
});

const Bookings = new mongoose.model('Bookings', BookingSchema, 'Bookings');

module.exports = Bookings;