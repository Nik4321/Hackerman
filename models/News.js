const mongoose = require('mongoose');

let newsSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: Date, default: Date.now()}
});

const News = mongoose.model('News', newsSchema, 'news');

module.exports = News;
