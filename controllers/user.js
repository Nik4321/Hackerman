const User = require('mongoose').model('User');
const Discussion = require('mongoose').model('Discussion');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost:(req, res) => {
        let registerArgs = req.body;

        User.findOne({email: registerArgs.email}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
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

                        res.redirect('/')
                    })
                });
            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user ||!user.authenticate(loginArgs.password)) {
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

                let returnUrl = '/';
                if (req.session.returnUrl) {
                    returnUrl = req.session.returnUrl;
                    delete req.session.returnUrl;
                }
                res.redirect(returnUrl);
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },

    details: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            // linking to '/'. Neave it like this
            //req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        User.findById(id).populate().then(user => {
            res.render('user/details', user)
        });
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
                .then(updateStatus => {
                    res.render('user/adminSettings', {successMsgForAdminAdd: 'User is now Admin!'});
                });
            }
        });
    },

    userDelete: (req, res) => {

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
        
        User.findOne({email: adminArgs.emailUserDelete}).then(user => {
            
            let errorMsg = '';
            if (!user) {
                errorMsg = "User does not exist!";
            } else if (user.isAdmin) {
                errorMsg = "Cannot delete other Admins!"
            }

            if (errorMsg) {
                adminArgs.errorMsgForUserDelete = errorMsg;
                res.render('user/adminSettings', adminArgs);
            } else {
                User.findOneAndRemove({email: adminArgs.emailUserDelete}).then(updateStatus => {
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
                errorMsg = "User does not exist!";
            } else if(!user.isAdmin) {
                errorMsg = "User is not admin!";
            } else if (req.body.masterPassword !== masterPass) {
                errorMsg = "Master Password is incorrect"
            }

            if (errorMsg) {
                adminArgs.errorMsgForAdminDelete = errorMsg;
                res.render('user/adminSettings', adminArgs);
            } else {
                User.findOneAndRemove({email: adminArgs.emailAdminDelete}).then(updateStatus => {
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
            res.render('user/userDiscussions', {discussions: discussions})
        });
    },

    editProfileGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        User.findById(id).populate().then(user => {
            res.render('user/editProfile', user)
        });
    },

    editProfilePost: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()) {
            req.session.returnUrl = req.originalUrl;

            res.render('user/login', {error: 'Must be logged in to do that'});
            return;
        }

        let editProfileArgs = req.body;

        let errorMsg = '';
        if (!editProfileArgs.fullName) {
            errorMsg = 'Invalid Full Name';
        } else if (!editProfileArgs.email) {
            errorMsg = 'Invalid Email';
        } // else if (editProfileArgs.email === req.params.email) {
        //    errorMsg = 'Cannot change email to same';
        //} else if (editProfileArgs.fullname === req.params.fullName) {
        //    errorMsg = 'Cannot change full name to same';
        //}

        if (errorMsg) {
            editProfileArgs.error = errorMsg;
            res.render('/user/editProfile/:id', editProfileArgs);
        } else {
            User.update({_id: id}, {$set: {
                fullName: editProfileArgs.fullName,
                email: editProfileArgs.email,
                birthDate: editProfileArgs.birthDate,
                birthPlace: editProfileArgs.birthPlace,
                currentAddress: editProfileArgs.currentAddress,
                nationality: editProfileArgs.nationality
            }}).then(updateStatus => {
                res.redirect(`/user/details/${id}`);
            });
        }
    },

};
