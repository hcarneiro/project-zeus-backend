const express = require('express');
const router = express.Router();

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

module.exports = router;