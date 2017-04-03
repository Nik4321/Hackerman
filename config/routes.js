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
