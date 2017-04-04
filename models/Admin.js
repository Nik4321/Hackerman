const mongoose = require('mongoose');

let adminSchema = mongoose.Schema({
        email: {type: [String], required: true, unique: true},
});
