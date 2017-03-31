const path = require('path');

module.exports = {
    development: {
        rootFolder: path.normalize(path.join(__dirname, '/../')),
        connectionString: 'mongodb://test:test@ds147510.mlab.com:47510/hackerman'
    },
    production:{}
};
