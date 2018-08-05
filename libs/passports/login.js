const User = require('../../models/user');

module.exports.type = 'zeusLogin';

module.exports.login = function (req, res) {
  // TODO: Export login from login route to a lib and use it here
};

module.exports.validate = function (req, res, serverData) {
  return User.findOne({
    where: serverData,
    attributes: [
      'id',
      'email',
      'firstName',
      'lastName',
      'userRoleId',
      'createdAt'
    ]
  });
};

module.exports.logout = function logoutZeusLogin(req) {
  delete req.session.server.passports.zeusLogin;
  delete req.session.accounts.zeusLogin;
  
  return Promise.resolve();
};