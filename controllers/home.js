const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');

module.exports = {
    index: (req, res) => {
        Discussion.find({}).sort({date: -1}).limit(8).populate('author').then(discussions => {
            res.render('home/index', {discussions: discussions});
        });
    }
};
