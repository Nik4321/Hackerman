const User = require('mongoose').model('User');
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

        User.findById(id).populate().then(user => {
            res.render('user/details', user)
        });
    },

    adminPost: (req, res) => {
        let id = req.params.id;

        let adminArgs = req.body;
        User.findOne({email: adminArgs.email}).then(user =>{

            let errorMsg = '';
            if(!user) {
                errorMsg = "User does not exist!";
            }

            if (errorMsg) {
                adminArgs.error = errorMsg;
                res.render(`/user/details/${id}`, adminArgs);
            } else {
                User.update({email: adminArgs.email}, {$set: {isAdmin: true}})
                .then(updateStatus => {
                    res.redirect(`/user/details/${id}`);
                });
            }
        });
    },

    editProfileGet: (req, res) => {
        let id = req.params.id;

        User.findById(id).populate().then(user => {
            res.render('user/editProfile', user)
        });
    },

    editProfilePost: (req, res) => {
        let id = req.params.id;

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
            User.update({_id: id}, {$set: {fullName: editProfileArgs.fullName, email: editProfileArgs.email}})
            .then(updateStatus => {
                res.redirect(`/user/details/${id}`);
            });
        }
    }
};
