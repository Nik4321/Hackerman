const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = (config) => {
    mongoose.connect(config.connectionString);

    mongoose.connection.once('open', (error) => {
        if (error) {
            console.log(error);
            return;
        }
    });

    require('./../models/User').seedAdmin();
    require('./../models/Discussion');
    require('./../models/News');
};
