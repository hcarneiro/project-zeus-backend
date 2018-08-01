const express = require('express');
const router = express.Router();
const Tasks = require('../../models/tasks');

router.get('/', async (req, res) => {
  const tasks = await Tasks.findAll({
    order: [
      ['createdAt', 'DESC']
    ]
  });

  if (tasks) {
    res.send(tasks);
  } else {
    const notFound = {
      message: `No tasks found`
    };
    res.status(404).send(notFound)
  }
});

router.get('/:id', async (req, res) => {
  const task = await Tasks.findById(req.params.id);

  if (task) {
    res.send(task);
  } else {
    const notFound = {
      message: `No task found with ID ${req.params.id}`
    };
    res.status(404).send(notFound)
  }
});

module.exports = router;