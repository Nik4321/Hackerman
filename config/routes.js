const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const discussionController = require('./../controllers/discussion');
const newsController = require('./../controllers/news');

module.exports = (app) => {

    app.get('/', homeController.index);

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

    app.get('/user/editProfile/:id', userController.editProfileGet);
    app.post('/user/editProfile/:id', userController.editProfilePost);

    // Discussion routes:
    app.get('/discussion/listAll', discussionController.discussionsGet);

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

    app.get('/news/details/:id', newsController.details);

    app.get('/news/create', newsController.createGet);
    app.post('/news/create', newsController.createPost);

    app.get('/news/edit/:id', newsController.editGet);
    app.post('/news/edit/:id', newsController.editPost);

    app.get('/news/delete/:id', newsController.deleteGet);
    app.post('/news/delete/:id', newsController.deletePost);
};
