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

};
