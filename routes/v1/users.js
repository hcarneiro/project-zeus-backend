const express = require('express');
const router = express.Router();
const config = require('../../libs/config')
const User = require('../../models/user');

router.get('/', async (req, res) => {
  if (req.user) {
    const user = await req.user.getData();
    user.auth_token = req.auth_token;

    res.send({
      user,
      session: req.session,
      host: config.host
    });
  }
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

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