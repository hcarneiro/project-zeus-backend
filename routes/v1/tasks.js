const express = require('express');
const router = express.Router();
const Task = require('../../models/task');

router.post('/', (req, res) => {
  req.user.createTask(req.body)
    .then((task) => {
      res.send(task);
    })
    .catch((error) => {
      res.status(500).send(error)
    });
});

router.get('/', async (req, res) => {
  const tasks = await Task.findAll({
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
  const task = await Task.findById(req.params.id);

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