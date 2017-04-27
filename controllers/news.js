const News = require('mongoose').model('News');
const ReplyingNews = require('mongoose').model('ReplyingNews');
const RatingNews = require('mongoose').model('RatingsNews');

module.exports = {

    newsGet: (req, res) => {
        News.find({}).sort({date: -1}).limit(10).populate('author').then(news => {
            res.render('news/listAll', {news: news});
        });
    },

    newsSearch: (req, res) => {
        let searchNews = req.body.newsSearch;

        News.find({title: new RegExp(searchNews, 'i')}).sort({date: -1}).populate('author').then(news => {
            res.render('news/listAll', {news: news, searchNews});
        });

    },

    createGet: (req, res) => {
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.render('home/index', {error: "You don't have permission to access!"});

            return;
        }

        res.render('news/create');
    },

    createPost: (req, res) => {
        let newsArgs = req.body;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.render('home/index', {error: 'You have to be an Admin to have access to the  News'});
            return;
        }

        let errorMsg = '';

        if (!newsArgs.title) {
            errorMsg = 'Invalid title!';
        } else if (!newsArgs.content) {
            errorMsg = 'Invalid content';
        }

        if (errorMsg) {
            res.render('news/create', {error: errorMsg});
            return;
        }

        // Fixing bug from editor.
        if(newsArgs.content === '<br>') {
            newsArgs.content = '';
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

    details: (req, res, next) => {
        let id = req.params.id;

        News.findById(id).populate('author').then(news => {
            ReplyingNews.find({idNews: news._id}).populate('author').then(replies => {
                RatingNews.find({idNews: news._id}).then(ratings => {
                    let count = 0;
                    let max = 0;
                    ratings.forEach(
                        function avg (value) {
                            count++;
                            max += value.rating;

                        }
                    );
                    let average = max / count;
                    let fixedAverage = (Number(average.toFixed(2)));

                    if (!req.user) {
                        res.render('news/details', {rating: fixedAverage, news: news, replies: replies, isUserAuthorized: false});
                        return;
                   }
                   let isUserAuthorized = req.user.isAdmin;
                   res.render('news/details', {rating: fixedAverage, news: news, replies: replies, isUserAuthorized: isUserAuthorized});
                });
            });
        }).catch(next);

    },    

    editGet: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.render('home/index', {error: 'You have to be an Admin to have access to the  News'});
            return;
        }

        News.findById(id).then(news => {
            if (!req.user.isAdmin && !req.user.isAuthorNews(news)) {
                res.redirect('/');
                return;
            }            
            res.render('news/edit', news);
        }).catch(next);
    },

    editPost: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.render('home/index', {error: 'You have to be an Admin to have access to the  News'});
            return;
        }

        let newsArgs = req.body;

        let errorMsg = '';
        if (!newsArgs.title) {
            errorMsg = 'News title cannot be empty!';
        }

        if (errorMsg) {
            res.render('news/edit', {error: errorMsg});
        } else {
            News.update({_id: id}, {$set: {title: newsArgs.title, content: newsArgs.content}})
            .then( () => {
                res.redirect(`/news/details/${id}`);
            }).catch(next);
        }
    },

    deleteGet: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.render('home/index', {error: 'You have to be an Admin to have access to the  News'});
            return;
        }        

        News.findById(id).then(news => {
            if (!req.user.isAdmin && !req.user.isAuthorNews(news)) {
                res.redirect('/');
                return;
            }

            res.render('news/delete', news);
        }).catch(next);
    },

    deletePost: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.render('home/index', {error: 'You have to be an Admin to have access to the  News'});
            return;
        }

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
                    res.redirect('/news/listAll');
                });
            }
        }).catch(next);
    },

    replyPost: (req, res, next) => {
        let id = req.params.id;
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }
        
        let replyArgs = req.body;
        let userId = req.user.id;

        if (!replyArgs.replyContent) {
            res.redirect(req.originalUrl);
            return;
        }

        let reply = {
          content: replyArgs.replyContent,
          author: userId,
          idNews: id
        };

        ReplyingNews.create(reply).then(reply => {
            News.findById({_id: id}).then(news => {
                news.reply.push(reply);
                news.save(err => {
                    if (err) {
                        res.render(`news/details/${id}`, {error: err.message});
                    } else {
                        res.redirect(req.originalUrl);
                    }
                });
            }).catch(next);
        });
    },

    votesPost: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = `/news/details/${id}`;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        let voteArgs = req.body;
        let userId = req.user.id;

        let rating = {
            rating: voteArgs.rating,
            author: userId,
            idNews: id
        };

        //  ).then( user => {
        //     var isInRating = 
        // });
        
        News.findById({_id: id}).then(news => {
            RatingNews.findOne({author : req.user._id }).then( rating => {

                if (rating) {
                    // Remove this if you don't wanna update the rating
                    RatingNews.update({author: req.user._id}, {$set: {
                        rating: voteArgs.rating
                    }}).then( () => {
                        res.redirect(`/news/details/${id}`);
                        return;
                    });
                    // Actually don't touch it.
                }
            }).catch(() => {
                RatingNews.create(rating).then(rating => {
                    news.rating.push(rating);
                    res.redirect(`/news/details/${id}`);
                });
            });
        });
    },
};
