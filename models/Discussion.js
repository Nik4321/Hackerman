const mongoose = require('mongoose');

let discussionSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: Date, default: Date.now()},
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Replying' }]
});

let discussionReplyingSchema = mongoose.Schema({
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: Date, default: Date.now()}
});

const Discussion = mongoose.model('Discussion', discussionSchema);
const Replying = mongoose.model('Replying', discussionReplyingSchema);

module.exports = Discussion;
module.exports = Replying;
