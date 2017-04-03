const News = require('mongoose').model('News');

module.exports = {

    newsGet: (req, res) => {
        News.find({}).limit(6).populate('author').then(news => {
            res.render('news/all', {news: news});
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
                    res.redirect('/', {error: err.message});
                } else {
                    res.redirect('/');
                }
            });
        });
    },
};
