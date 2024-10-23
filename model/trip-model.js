const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
    day: {
        type: Number,
        require: true
    },
    data: {
        type: [String],
        required: true
    }
})

const tripSchema = new mongoose.Schema({
    tripname: {
        type: String,
        require: true
    },
    location:{
        type: String,
        require: true
    },
    fromDate: {
        type: Date,
        require: true
    },
    toDate: {
        type: Date,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    available: {
        type: Number,
        require: true
    },
    included: {
        type: [String],
        require: true,
        default:null
    },
    description: {
        type: String,
        require: true,
        default:null
    },
    days: {
        type: [daySchema],
        require: false,
        default:null
    },
    image:{
        type: [String],
        require: true
    }
});

const Trip = new mongoose.model('trips',tripSchema,'trips');

module.exports = Trip;