const mongoose = require('mongoose');
const Role = require('mongoose').model('Role');

let userSchema = mongoose.Schema({
        email: {type: String, required: true, unique: true},
    });
