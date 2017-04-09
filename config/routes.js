const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const discussionController = require('./../controllers/discussion');
const newsController = require('./../controllers/news');
const editProfileController = require('./../controllers/editProfile');

module.exports = (app) => {

    app.get('/', homeController.index);

    // User routes:
    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/logout', userController.logout);

    app.get('/user/details/:username', userController.details);
    app.post('/user/details/:username', userController.adminPost);
    // Profile Page routes:
    app.get('/user/editProfile', editProfileController.editProfileGet);
    app.post('/user/editProfile', editProfileController.editProfilePost);

    app.get('/user/details/:id', userController.details);
    app.post('/user/details/:id', userController.adminPost);

    //app.get('/user/details/:username/settings')
    // Discussion routes:
    app.get('/discussion/listAll', discussionController.discussionsGet);

    app.get('/discussion/details/:id', discussionController.details);

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
