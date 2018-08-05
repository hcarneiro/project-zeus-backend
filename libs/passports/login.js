const User = require('../../models/user');

module.exports.type = 'zeusLogin';

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