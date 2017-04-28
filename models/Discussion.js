const mongoose = require('mongoose');
const dateFormat = require('dateformat');
const ObjectID = mongoose.Schema.Types.ObjectId;

let now = new Date().now;

let discussionSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    author: {type: ObjectID, required: true, ref: 'User'},
    date: {type: String, default: dateFormat(now, 'isoDate')},
    reply: [{ type: ObjectID, ref: 'ReplyingDiscussions' }]
});

let discussionReplyingSchema = mongoose.Schema({
    content: {type: String},
    author: {type: ObjectID, required: true, ref: 'User'},
    date: {type: String, default: dateFormat(now, 'isoDate')},
    idDiscussion: {type: ObjectID, ref: 'Discussion'}
});

const Discussion = mongoose.model('Discussion', discussionSchema);
const ReplyingDiscussions = mongoose.model('ReplyingDiscussions', discussionReplyingSchema);

module.exports = Discussion;
module.exports = ReplyingDiscussions;
