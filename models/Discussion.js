const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

let discussionSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    author: {type: ObjectID, required: true, ref: 'User'},
    date: {type: Date, default: Date.now()},
    reply: [{ type: ObjectID, ref: 'Replying' }]
});

let discussionReplyingSchema = mongoose.Schema({
    content: {type: String},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: Date, default: Date.now()}
});

const Discussion = mongoose.model('Discussion', discussionSchema);
const Replying = mongoose.model('Replying', discussionReplyingSchema);

module.exports = Discussion;
module.exports = Replying;
