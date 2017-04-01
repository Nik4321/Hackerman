const mongoose = require('mongoose');

let discussionSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: Date, default: Date.now()}
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
