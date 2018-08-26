const express = require('express');
const router = express.Router();
const database = require('../../libs/database');
const Task = require('../../models/task');
const authenticate = require('../../libs/authenticate');

router.use(authenticate);

router.get('/', async (req, res) => {
  const projects = await req.user.getProjects({
    include: [{
      model: Task
    }],
    order: [
      ['createdAt', 'DESC']
    ]
  });

  if (projects) {
    res.send(projects);
  } else {
    const notFound = {
      message: `No projects found`
    };
    res.status(404).send(notFound)
  }
});

router.get('/:id', async (req, res) => {
  const project = await database.db.models.project.findOne({
    where: {
      id: req.params.id
    },
    include: [{
      model: Task
    }]
  });

  if (project) {
    res.send(project);
  } else {
    const notFound = {
      message: `No project found with ID ${req.params.id}`
    };
    res.status(404).send(notFound)
  }
});

router.get('/:id/tasks', (req, res) => {
  return database.db.models.project.findById(req.params.id)
    .then((project) => {
      return project.getTask({
        order: [
          ['createdAt', 'DESC']
        ]
      });
    })
    .then((projectTasks) => { 
      if (projectTasks) {
        res.send(projectTasks);
      } else {
        const notFound = {
          message: `No tasks found for the project with ID ${req.params.id}`
        };
        res.status(404).send(notFound)
      }
    });
});

module.exports = router;