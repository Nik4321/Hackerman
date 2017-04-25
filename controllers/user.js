const User = require('mongoose').model('User');
const Discussion = require('mongoose').model('Discussion');
const News = require('mongoose').model('News');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost:(req, res) => {
        let registerArgs = req.body;

        User.findOne({email: registerArgs.email}).then(user => {
            let errorMsg = '';
            let regexForEmail = new RegExp (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

            if (!regexForEmail.test(registerArgs.email)){
                errorMsg = 'Please enter a valid email!';
            } else if (user) {
                errorMsg = 'User with the same email exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!';
            } else if (registerArgs.password.length < 6) {
                errorMsg = 'Password must be at least 6 characters';
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs);
            } else {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let userObject = {
                    email: registerArgs.email,
                    passwordHash: passwordHash,
                    fullName: registerArgs.fullName,
                    salt: salt
                };

                User.create(userObject).then(user => {
                    req.logIn(user, (err) => {
                        if (err) {
                            registerArgs.error = err.message;
                            res.render('user/register', registerArgs);
                            return;
                        }

                        res.redirect(`/user/details/${user._id}`);
                    });
                });
            }
        });
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user || !user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/user/login', {error: err.message});
                    return;
                }

                let returnUrl = `/user/details/${user._id}`;
                if (req.session.returnUrl) {
                    returnUrl = req.session.returnUrl;
                    delete req.session.returnUrl;
                }
                res.redirect(returnUrl);
            });
        });
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },

    details: (req, res, next) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
        //  Leave it like this
        //  linking to '/'.
        //  req.session.returnUrl = req.originalUrl;
            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        User.findById(id).populate().then(user => {
            res.render('user/details', user);
        }).catch(next);
    },

    adminSettingsGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.redirect('/');
            return;
        }

        res.render('user/adminSettings');
    },

    adminPost: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (!req.user.isAdmin) {
            res.redirect('/');
            return;
        }

        let adminArgs = req.body;
        User.findOne({email: adminArgs.emailAdminAdd}).then(user =>{

            let errorMsg = '';
            if (!user) {
                errorMsg = 'User does not exist!';
            } else if (req.user.email === adminArgs.emailAdminAdd) {
                errorMsg = 'Cannot make yourself into an admin!';
            } else if (user.isAdmin) {
                errorMsg = 'User is already Admin!';
            } 

            if (errorMsg) {
                adminArgs.errorMsgForAdminAdd = errorMsg;
                res.render('user/adminSettings', adminArgs);
            } else {
                User.update({email: adminArgs.emailAdminAdd}, {$set: {isAdmin: true}})
                .then( () => {
                    res.render('user/adminSettings', {successMsgForAdminAdd: 'User is now Admin!'});
                });
            }
        });
    },

    userDelete: (req, res) => {

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that!'});
            return;
        }

        if (!req.user.isAdmin) {
            res.redirect('/');
            return;
        }

        let adminArgs = req.body;
        
        User.findOne({email: adminArgs.emailUserDelete}).then(user => {
            
            let errorMsg = '';
            if (!user) {
                errorMsg = 'User does not exist!';
            } else if (user.isAdmin) {
                errorMsg = 'Cannot delete other Admins!';
            }

            if (errorMsg) {
                adminArgs.errorMsgForUserDelete = errorMsg;
                res.render('user/adminSettings', adminArgs);
            } else {
                User.findOneAndRemove({email: adminArgs.emailUserDelete}).then( () => {
                    res.render('user/adminSettings', {successMsgForUserDelete: 'User was deleted!'});
                });
            }
        });
    },

    adminDelete: (req, res) => {

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }
        if (!req.user.isAdmin) {
            res.redirect('/');
            return;
        }

        let adminArgs = req.body;

        User.findOne({email: adminArgs.emailAdminDelete}).then(user => {

            let errorMsg = '';
            let masterPass = 'ShadyMaster';
            if (!user) {
                errorMsg = 'User does not exist!';
            } else if(!user.isAdmin) {
                errorMsg = 'User is not admin!';
            } else if (req.body.masterPassword !== masterPass) {
                errorMsg = 'Master Password is incorrect';
            }

            if (errorMsg) {
                adminArgs.errorMsgForAdminDelete = errorMsg;
                res.render('user/adminSettings', adminArgs);
            } else {
                User.findOneAndRemove({email: adminArgs.emailAdminDelete}).then( () => {
                    res.render('user/adminSettings', {successMsgForAdminDelete: 'Admin was deleted!'});
                });
            }
        });
    },

    userDiscussionsGet: (req, res) => {
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }        

        Discussion.find({author: req.user._id}).populate('author').then(discussions => {
            res.render('user/userDiscussions', {discussions: discussions});
        });
    },

    userNewsGet: (req, res) => {
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        News.find({author: req.user._id}).populate('author').then(news => {
            res.render('user/userNews', {news: news});
        });
    },

    editProfileGet: (req, res) => {
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        User.findById(req.user._id).populate().then(user => {
            res.render('user/editProfile', user);
        });
    },

    editProfilePost: (req, res) => {
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        let profileImage = req.files.image;
        let editProfileArgs = req.body;
        let userImagePath;

        if (profileImage) {
            userImagePath = `./public/images/UserPic/${req.user._id}`;

            profileImage.mv(`./public/images/UserPic/${req.user._id}`, err => {
                if (err) {
                    console.log(err.message);
                }
            });
        }

        User.update({_id: req.user._id}, {$set: {
            fullName: editProfileArgs.fullName,
            birthDate: editProfileArgs.birthDate,
            birthPlace: editProfileArgs.birthPlace,
            currentAddress: editProfileArgs.currentAddress,
            nationality: editProfileArgs.nationality,
            imagePath: userImagePath
        }}).then( () => {
            res.redirect(`/user/details/${req.user._id}`);
        });
    },

    accountDelete: (req, res) => {
        let deleteArgs = req.body;
        
        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        if (deleteArgs.password !== deleteArgs.repeatedPassword) {
            res.render('user/editProfile', {errorAccountDelete: 'Passwords do not Match!'});
            return;
        }

        User.findOne({_id: req.user._id}).then(user => {
            if (!user.authenticate(deleteArgs.password)) {
                res.render('user/editProfile', {errorAccountDelete: 'Password is invalid!'});
                return;
            }

            User.findOneAndRemove({_id: req.user._id}).then( () => {
                res.redirect('/');
            });
        });
    },
};
