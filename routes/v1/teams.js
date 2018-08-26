const express = require('express');
const router = express.Router();
const authenticate = require('../../libs/authenticate');

router.use(authenticate);

router.get('/', async (req, res) => {
  const teams = await req.user.getTeams({
    order: [
      ['name', 'asc']
    ]
  });

  if (teams) {
    res.send(teams);
  } else {
    const notFound = {
      message: `No teams found`
    };
    res.status(404).send(notFound)
  }
});

module.exports = router;