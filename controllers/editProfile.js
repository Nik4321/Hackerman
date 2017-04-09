const EditProfile = require('mongoose').model('EditProfile');

module.exports = {

    editProfileGet: (req, res) => {
        let id = req.params.id;
        console.log(id);
        EditProfile.findById(id).then(editProfile => {
            res.render('user/editProfile', editProfile);
        });
    },

    editProfilePost: (req, res) => {
        let id = req.params.id;

        let editProfileArgs = req.body;

        EditProfile.update({_id: id}, {$set: {
            firstName: editProfileArgs.firstName,
            lastName: editProfileArgs.lastName,
            birthday: editProfileArgs.birthday,
            currentAddress: editProfileArgs.currentAddress,
            birthPlace: editProfileArgs.birthPlace,
            nationality: editProfileArgs.nationality
        }}).then(updateStatus => {
                res.redirect(`/user/details/${id}`);
            });
    }
};