const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const discussionController = require('./../controllers/discussion');
const newsController = require('./../controllers/news');
const contactsController = require('./../controllers/contacts');

module.exports = (app) => {

    app.get('/', homeController.index);

    app.get('/contacts/viewContacts', contactsController.contactsGet);

    // User routes:
    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/logout', userController.logout);

    app.get('/user/details/:id', userController.details);

    app.get('/user/adminSettings', userController.adminSettingsGet);
    
    app.post('/user/adminAdd', userController.adminPost);
    app.post('/user/userDelete', userController.userDelete);
    app.post('/user/adminDelete', userController.adminDelete);

    app.get('/user/userDiscussions', userController.userDiscussionsGet);
    app.get('/user/userNews', userController.userNewsGet);

    app.get('/user/editProfile', userController.editProfileGet);
    app.post('/user/editProfile', userController.editProfilePost);
    app.post('/user/editProfile/delete', userController.accountDelete);

    // Discussion routes:
    app.get('/discussion/listAll', discussionController.discussionsGet);
    app.post('/discussion/listAll', discussionController.discussionSearch);

    app.get('/discussion/details/:id', discussionController.details);
    app.post('/discussion/details/:id', discussionController.replyPost);

    app.get('/discussion/create', discussionController.createGet);
    app.post('/discussion/create', discussionController.createPost);

    app.get('/discussion/edit/:id', discussionController.editGet);
    app.post('/discussion/edit/:id', discussionController.editPost);

    app.get('/discussion/delete/:id', discussionController.deleteGet);
    app.post('/discussion/delete/:id', discussionController.deletePost);

    // News routes:
    app.get('/news/listAll', newsController.newsGet);
    app.post('/news/listAll', newsController.newsSearch);

    app.get('/news/details/:id', newsController.details);
    app.post('/news/details/:id', newsController.replyPost);
    app.post('/news/details/rating/:id', newsController.votesPost);


    app.get('/news/create', newsController.createGet);
    app.post('/news/create', newsController.createPost);

    app.get('/news/edit/:id', newsController.editGet);
    app.post('/news/edit/:id', newsController.editPost);

    app.get('/news/delete/:id', newsController.deleteGet);
    app.post('/news/delete/:id', newsController.deletePost);

    //An error handling middleware
    app.use(function (req, res) {
        res.status(404);
        res.render('error');
    });
    
    app.use(function (err, req, res, next) {
        res.status(404);
        console.log(err.message);
        res.render('error', { error: err.message });
    });
};
