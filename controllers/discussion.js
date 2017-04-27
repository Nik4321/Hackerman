const Discussion = require('mongoose').model('Discussion');
const ReplyingDiscussions = require('mongoose').model('ReplyingDiscussions');
const RatingDiscussions = require('mongoose').model('RatingsDiscussions');

module.exports = {

    discussionsGet: (req, res) => {
        Discussion.find({}).sort({date: -1}).limit(20).populate('author').then(discussions => {
            res.render('discussion/listAll', {discussions: discussions});
        });
    },

    discussionSearch: (req, res) => {
        let searchDiscussions = req.body.discussionsSearch;
        
        Discussion.find({title: new RegExp(searchDiscussions, 'i')}).sort({date: -1}).populate('author').then(discussions => {
            res.render('discussion/listAll', {discussions: discussions, searchDiscussions});
        });

    },

    createGet: (req, res) => {
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        res.render('discussion/create');
    },

    createPost: (req, res) => {
        let discussionArgs = req.body;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        let errorMsg = '';

        if (!discussionArgs.title) {
            errorMsg = 'Invalid title!';
        }

        if (errorMsg) {
            res.render('discussion/create', {error: errorMsg});
            return;
        }

        // Fixing bug from editor.
        if(discussionArgs.content === '<br>') {
            discussionArgs.content = '';
        }

        discussionArgs.author = req.user.id;
        Discussion.create(discussionArgs).then(discussion => {
            req.user.discussions.push(discussion.id);
            req.user.save(err => {
                if (err) {
                    res.redirect('/discussion/listAll', {error: err.message});
                } else {
                    res.redirect('/discussion/listAll');
                }
            });
        });

    },

    details: (req, res, next) => {
        let id = req.params.id;

        Discussion.findById(id).populate('author').then(discussion => {
            ReplyingDiscussions.find({idDiscussion: discussion._id}).populate('author').then(replies => {
                RatingDiscussions.find({idDiscussion: discussion._id}).then(ratings => {

                    let count = 0;
                    let max = 0;
                    ratings.forEach(
                        function avg(value) {
                            count++;
                            max += value.rating;
                        }
                    );
                    let average = max / count;
                    let fixedAverage = (Number(average.toFixed(2)));

                    if (!req.user) {
                        res.render('discussion/details', {
                            rating: fixedAverage,
                            discussion: discussion,
                            replies: replies,
                            isUserAuthorized: false
                        });
                        return;
                    }

                    let isUserAuthorized = req.user.isAdmin || req.user.isAuthorDiscussion(discussion);
                    res.render('discussion/details', {
                        discussion: discussion,
                        replies: replies,
                        isUserAuthorized: isUserAuthorized
                    });
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

        Discussion.findById(id).then(discussion => {
            if (!req.user.isAdmin && !req.user.isAuthorDiscussion(discussion)) {
                res.redirect('/');
                return;
            }
            res.render('discussion/edit', discussion);
        }).catch(next);
    },

    editPost: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        let discussionArgs = req.body;

        let errorMsg = '';
        if (!discussionArgs.title) {
            errorMsg = 'Discussion title cannot be empty!';
        }

        if (errorMsg) {
            res.render('discussion/edit', {error: errorMsg});
        } else {
            Discussion.update({_id: id}, {$set: {title: discussionArgs.title, content: discussionArgs.content}})
            .then( () => {
                res.redirect(`/discussion/details/${id}`);
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

        Discussion.findById(id).then(discussion => {
            if (!req.user.isAdmin && !req.user.isAuthorDiscussion(discussion)) {
                res.redirect('/');
                return;
            }

            res.render('discussion/delete', discussion);
        }).catch(next);
    },

    deletePost: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        Discussion.findOneAndRemove({_id: id}).populate('author').then(discussion => {
            let author = discussion.author;

            // Index of the discussion's ID in the author's discussions.
            let index = author.discussions.indexOf(discussion.id);

            if (index < 0) {
                let errorMsg = 'Discussion was not found for the author!';
                res.render('discussion/delete', {error: errorMsg});
            } else {
                // Remove count elements after given index (inclusive).
                let count = 1;
                author.discussions.splice(index, count);
                author.save().then((user) => {
                    res.redirect('/discussion/listAll');
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
          idDiscussion: id
        };

        ReplyingDiscussions.create(reply).then(reply => {
            Discussion.findById({_id: id}).then(discussion => {
                discussion.reply.push(reply);
                discussion.save(err => {
                    if (err) {
                        res.render(`discussion/details/${id}`, {error: err.message});
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
            req.session.returnUrl = `/discussion/details/${id}`;

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

        Discussion.findById({_id: id}).then(discussion => {
            RatingDiscussions.findOne({author : req.user._id }).then( rating => {

                if (rating) {
                    RatingDiscussions.update({author: req.user._id}, {$set: {
                        rating: voteArgs.rating
                    }}).then( () => {
                        res.redirect(`/discussion/details/${id}`);
                        return;
                    });
                }
            }).catch(() => {
                RatingDiscussions.create(rating).then(rating => {
                    discussion.rating.push(rating);
                    res.redirect(`/discussion/details/${id}`);
                });
            });
        });
    },

};
