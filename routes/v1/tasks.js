const express = require('express');
const router = express.Router();
const database = require('../../libs/database');
const authenticate = require('../../libs/authenticate');

router.use(authenticate);

router.post('/', (req, res) => {
  debugger;
  let taskResponse;
  database.db.models.task.create(req.body)
    .then((task) => {
      taskResponse = task

      if (!req.body.projectId) {
        return task.addUser(req.user);
      }

      return database.db.models.project.findById(req.body.projectId)
        .then((project) => {
          return project.addTask(task);
        })
        .then(() => {
          return task.addUser(req.user);
        });
    })
    .then(() => {
      res.send(taskResponse);
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