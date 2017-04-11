const mongoose = require('mongoose');
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema(
   {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        discussions: {type: [mongoose.Schema.Types.ObjectId], default: []},
        news: {type: [mongoose.Schema.Types.ObjectId], default: []},
        salt: {type: String, required: true},
        isAdmin: {type: Boolean, default: false},
        joinDate: {type: Date, default: Date.now()},
        birthDate: {type: Date},
        birthPlace: {type: String},
        currentAddress: {type: String},
        nationality: {type: String}
       //document.getElementById("demo").innerHTML = d.toUTCString();
    }
);

userSchema.method ({
   authenticate: function (password) {
      let inputPasswordHash = encryption.hashPassword(password, this.salt);
      let isSamePasswordHash = inputPasswordHash === this.passwordHash;

      return isSamePasswordHash;
   },

   isAuthorDiscussion: function (discussion) {
      if(!discussion) {
         return false;
      }

      let isAuthorDiscussion = discussion.author.equals(this.id);

      return isAuthorDiscussion;
   },

   isAuthorNews: function (news) {
      if(!news) {
         return false;
      }

      let isAuthorNews = news.author.equals(this.id);

      return isAuthornews;
   },

   userIsAdmin: function (isAdmin) {
         return this.isAdmin;
   }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.seedAdmin = () => {
   let email = 'ShadyAdmin@gmail.com';
   User.findOne({email: email}).then(admin => {
      if(!admin) {
            let salt = encryption.generateSalt();
            let passwordHash = encryption.hashPassword('admin', salt);

            let user = {
               email: email,
               passwordHash: passwordHash,
               fullName: 'ShadyGuyzAdmin',
               discussions: [],
               news: [],
               salt: salt,
               isAdmin: true,
               joinDate: Date.now()
            };
            // Needs fixing for admins
            User.create(user).then(err => {
                  if(err) {
                     console.log(err.message);
                  } else {
                     console.log('Admin seeded!');
                  }
            });
         }
      });
};
