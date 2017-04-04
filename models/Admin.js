const mongoose = require('mongoose');

let adminSchema = mongoose.Schema({
        email: {type: String, required: true, unique: true},
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
