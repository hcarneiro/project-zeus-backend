const express = require('express');
const router = express.Router();
const Users = require('../../models/users');

router.get('/', async (req, res) => {
  const users = await Users.findAll();

  if (users) {
    res.send(users);
  } else {
    const notFound = {
      message: `No users found`
    };
    res.status(404).send(notFound)
  }
});

router.get('/:id', async (req, res) => {
  const user = await Users.findById(req.params.id);

  if (user) {
    res.send(user);
  } else {
    const notFound = {
      message: `No user found with ID ${req.params.id}`
    };
    res.status(404).send(notFound)
  }
});

module.exports = router;