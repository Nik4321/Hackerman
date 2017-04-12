const Discussion = require('mongoose').model('Discussion');
const Replying = require('mongoose').model('Replying');

module.exports = {

    discussionsGet: (req, res) => {
        Discussion.find({}).limit(6).populate('author').then(discussions => {
        res.render('discussion/listAll', {discussions: discussions});
        });
    },

    createGet: (req, res) => {
        res.render('discussion/create');
    },

    createPost: (req, res) => {
        let discussionArgs = req.body;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        let errorMsg = "";

        if (!discussionArgs.title) {
            errorMsg = 'Invalid title!';
        }

        if (errorMsg) {
            res.render('discussion/create', {error: errorMsg});
            return;
        }

        // Fixing bug from editor.
        if(discussionArgs.content === "<br>") {
            discussionArgs.content = "";
        }

        discussionArgs.author = req.user.id;
        Discussion.create(discussionArgs).then(discussion => {
            req.user.discussions.push(discussion.id);
            req.user.save(err => {
                if (err) {
                    res.redirect('/', {error: err.message});
                } else {
                    res.redirect('/');
                }
            });
        });

    },

    details: (req, res) => {
        let id = req.params.id;

        Discussion.findById(id).populate('author').then(discussion => {
            res.render('discussion/details', discussion)
        });

    },

    editGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        Discussion.findById(id).then(discussion => {
            if (!req.user.userIsAdmin || !req.user.isAuthorDiscussion(discussion)) {
                res.redirect('/');
                return;
            }
            User.create
            res.render('discussion/edit', discussion);
        });
    },

    editPost: (req, res) => {
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
            .then(updateStatus => {
                res.redirect(`/discussion/details/${id}`);
            });
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        Discussion.findById(id).then(discussion => {
            req.user.isAdmin(false).then(admin => {
                if (!isAdmin) {

                }
            })

            res.render('discussion/delete', discussion);
        });
    },

    deletePost: (req, res) => {
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
                    res.redirect('/');
                });
            }
        });
    },

    replyPost: (req, res) => {
        console.log(req.body);
        let id = req.params.id;

        let replyContent = req.body.replyContent;

        console.log(replyContent);

        replyContent.author = req.user.id;

        Replying.create(replyContent).then(reply => {


        });
    }

};
