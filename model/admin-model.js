const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    adminname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    phone: {
        type: Number,
        require: true,
        unique: true
    },
    countryCode: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true
    }
});

adminSchema.pre('save', async function (next){
    try {
        if(this.isModified('password')){ 
            this.password = await bcrypt.hash(this.password, 15);
        }
        next();
    } catch (error) {
        console.log(error);
        // next(error);
    }
});

adminSchema.methods.verifyPass = async function(pass) {
    try {
        return await bcrypt.compare(pass, this.password);
    } catch (error) {
        console.log('Error in checkPass:\n',error);
        // next(error);
    }
}

adminSchema.methods.generateToken = function() {
    try {
        return jwt.sign({
            adminID: this._id.toString(),
            email: this.email
        },
        process.env.JWT_TOKEN,
        {
            expiresIn: '1D'
        });
    } catch (error) {
        console.log('Error in customer model: ',error);
    }
}

const Admin = new mongoose.model('admin', adminSchema, 'admin');

module.exports = Admin;