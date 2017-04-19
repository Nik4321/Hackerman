const News = require('mongoose').model('News');

module.exports = {

    newsGet: (req, res) => {
        News.find({}).sort({date: -1}).limit(10).populate('author').then(news => {
            res.render('news/listAll', {news: news});
        });
    },

    details: (req, res) => {
        let id = req.params.id;
        // not done
        News.findById(id).populate('author').then(news =>{
            res.render('news/details', news)
        });
    },

    createGet: (req, res) => {
        res.render('news/create');
    },

    createPost: (req, res) => {
        let newsArgs = req.body;

        let errorMsg = "";

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to make articles';
        } else if (!newsArgs.title) {
            errorMsg = 'Invalid title!';
        } else if (!newsArgs.content) {
            errorMsg = 'Invalid content';
        }

        if (errorMsg) {
            res.render('news/create', {error: errorMsg});
            return;
        }

        // Fixing bug from editor.
        if(newsArgs.content === "<br>") {
            newsArgs.content = "";
        }

        newsArgs.author = req.user.id;

        News.create(newsArgs).then(news => {
            req.user.news.push(news.id);
            req.user.save(err => {
                if (err) {
                    res.redirect('/news/listAll', {error: err.message});
                } else {
                    res.redirect('/news/listAll');
                }
            });
        });
    },

    editGet: (req, res) => {
        let id = req.params.id;

        News.findById(id).then(news => {
            res.render('news/edit', news);
        });
    },

    editPost: (req, res) => {
        let id = req.params.id;

        let newsArgs = req.body;

        let errorMsg = '';
        if (!newsArgs.title) {
            errorMsg = 'News title cannot be empty!';
        }

        if (errorMsg) {
            res.render('news/edit', {error: errorMsg});
        } else {
            News.update({_id: id}, {$set: {title: newsArgs.title, content: newsArgs.content}})
            .then(updateStatus => {
                res.redirect(`/news/details/${id}`);
            });
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        News.findById(id).then(news => {
            res.render('news/delete', news);
        });
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        News.findOneAndRemove({_id: id}).populate('author').then(news => {
            let author = news.author;

            // Index of the discussion's ID in the author's discussions.
            let index = author.news.indexOf(news.id);

            if (index < 0) {
                let errorMsg = 'The News was not found for the author!';
                res.render('news/delete', {error: errorMsg});
            } else {
            // Remove count elements afther given index (inclusive).
            let count = 1;
            author.news.splice(index, count);
            author.save().then((user) => {
                res.redirect('/');
            });
            }
        });
    }

};
