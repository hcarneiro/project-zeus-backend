const _ = require('lodash');
const express = require('express');
const router = express.Router();
const authenticate = require('../../libs/authenticate');
const preloaders = require('../../libs/preloaders');

router.use(authenticate);
router.param('id', preloaders.organization);

router.get('/', function getOrganizations(req, res) {
  req.user.getOrganizations({
    attributes: ['id', 'name', 'isSuspended', 'type', 'createdAt']
  })
    .then(function onGetOrganizations(userOrganizations) {
      const organizations = userOrganizations.map(function (organization) {
        const plainOrg = organization.toJSON();
        return plainOrg;
      });

      res.send({ organizations });
    });
});

router.get('/:id/users', function getOrgUsers(req, res) {
  req.pzOrganization.getUsers({
    attributes: ['id', 'firstName', 'lastName', 'email', 'userTitle', 'profilePicture']
  })
    .then(function onGetUsers(users) {
      res.send({ users });
    });
});

module.exports = router;