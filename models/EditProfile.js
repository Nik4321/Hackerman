const mongoose = require('mongoose');

let editProfileSchema = mongoose.Schema ({
    firstName: {type: String},
    lastName: {type: String},
    birthday: {type: Date},
    currentAddress: {type: String},
    birthPlace: {type: String},
    nationality: {type: String}
});

const EditProfile = mongoose.model('EditProfile', editProfileSchema);

module.exports = EditProfile;