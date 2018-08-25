const express = require('express');
const router = express.Router();
const authenticate = require('../../libs/authenticate');
const config = require('../../libs/config')
const database = require('../../libs/database');

router.use(authenticate);

router.get('/', (req, res) => {
  if (req.user) {
    const user = req.user;
    user.auth_token = req.auth_token;

    res.send({
      user,
      session: req.session,
      host: config.host
    });
  }
});

router.put('/', async (req, res) => {
  database.db.models.user.findOne({
    where: { id: req.user.id },
    include: [{
      model: database.db.models.organization,
      attributes: ['id', 'name']
    }]
  })
  .then((user) => {
    [
      'firstName',
      'lastName',
      'email',
      'userTitle',
      'userBio',
      'userCity',
      'userCountry',
      'userResponsabilities',
      'profilePicture'
    ].forEach(function (param) {
      if (typeof req.body[param] !== 'undefined') {
        req.user[param] = req.body[param];
      }
    });

    if (req.body.newPassword) {
      if (!req.body.password) {
        return Promise.reject('The current password is required in order to update your password.');
      }

      if (!user.isValidPassword(req.body.password)) {
        return Promise.reject('The current password is not valid. Please try again.');
      }

      req.user.password = user.password;
      req.user.setPassword(req.body.newPassword);
    }

    return req.user.save();
  })
  .then(() => {
    res.send({
      user: req.user.get({ plain: true })
    });
  })
  .catch(function (err) {
    res.status(400);

    // Better error from sequelize rejections when the email is duplicate
    if (Array.isArray(err.errors) && err.errors.length && err.errors[0].path === 'email') {
      return res.send({
        message: 'This email address is already in use in our system.'
      });
    }

    res.send({
      message: err.message || err.description || err
    });
  });
});

module.exports = router;