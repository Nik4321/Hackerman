const Discussion = require('mongoose').model('Discussion');

module.exports = {
    createGet: (req, res) => {
    res.render('discussion/create');
    },

    createPost: (req, res) => {
        let discussionArgs = req.body;

        let errorMsg = "";

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to make articles';
        } else if (!discussionArgs.title) {
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

        Discussion.findById(id).populate('author').then(discussion =>{
            res.render('discussion/details', discussion)
        });
    },

    editGet: (req, res) => {
        let id = req.params.id;

        Discussion.findById(id).then(discussion => {
            res.render('discussion/edit', discussion);
        });
    },

    editPost: (req, res) => {
        let id = req.params.id;

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

        Discussion.findById(id).then(discussion => {
            res.render('discussion/delete', discussion);
        });
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        Discussion.findOneAndRemove({_id: id}).populate('author').then(discussion => {
            let author = discussion.author;

            // Index of the discussion's ID in the author's discussions.
            let index = author.discussions.indexOf(discussion.id);

            if (index < 0) {
                let errorMsg = 'Discussion was not found for the author!';
                res.render('discussion/delete', {error: errorMsg});
            } else {
            // Remove count elements afther given index (inclusive).
            let count = 1;
            author.discussions.splice(index, count);
            author.save().then((user) => {
                res.redirect('/');
            });
            }
        });
    },

};
