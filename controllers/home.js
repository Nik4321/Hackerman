const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');

module.exports = {
    index: (req, res) => {
        Discussion.find({}).limit(6).populate('author').then(discussions => {
            res.render('home/index', {discussions: discussions});
        });
    }
};
