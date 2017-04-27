const mongoose = require('mongoose');
const dateFormat = require('dateformat');
const ObjectID = mongoose.Schema.Types.ObjectId;

let now = new Date().now;

let newsSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    author: {type: ObjectID, required: true, ref: 'User'},
    date: {type: String, default: dateFormat(now, 'isoDate')},
    reply: [{ type: ObjectID, ref: 'ReplyingNews' }],
    rating: [{type: ObjectID, ref: 'RatingsNews'}]
});

let newsReplyingSchema = mongoose.Schema({
    content: {type: String},
    author: {type: ObjectID, required: true, ref: 'User'},
    date: {type: String, default: dateFormat(now, 'isoDate')},
    idNews: {type: ObjectID, ref: 'News'}
});

let newsVotesSchema = mongoose.Schema({
    rating: {type: Number},
    author: {type: ObjectID, required: true, ref: 'User'},
    idNews: {type: ObjectID, ref: 'News'}
});

const News = mongoose.model('News', newsSchema, 'news');
const ReplyingNews = mongoose.model('ReplyingNews', newsReplyingSchema);
const RatingNews = mongoose.model('RatingsNews', newsVotesSchema);

module.exports = News;
module.exports = ReplyingNews;