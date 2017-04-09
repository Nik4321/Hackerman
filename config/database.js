const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = (config) => {
    mongoose.connect(config.connectionString);

    mongoose.connection.once('open', (error) => {
        if (error) {
            console.log(error);
            return;
        }

        console.log('MongoDB ready!')
    });

    require('./../models/User').seedAdmin();
    require('./../models/Admin');
    require('./../models/Discussion');
    require('./../models/News');
    require('./../models/EditProfile')
};
