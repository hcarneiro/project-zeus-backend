const express = require('express');
const router = express.Router();
const Users = require('../../models/users');

router.get('/', async (req, res) => {
  Users.findAll().then(users => {
    res.send(users);
  });
});

router.get('/:id', async (req, res) => {
  Users.findById(req.params.id).then(user => {
    if (user) {
      res.send(user);
    } else {
      const notFound = {
        message: `No user found with ID ${req.params.id}`
      };
      res.send(notFound);
    }
  });
});

module.exports = router;