const express = require('express');
const router = express.Router();
const Projects = require('../../models/projects');
const Tasks = require('../../models/tasks');

router.get('/', async (req, res) => {
  const projects = await Projects.findAll({
    include: [{
      model: Tasks
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
  const project = await Projects.findOne({
    where: {
      id: req.params.id
    },
    include: [{
      model: Tasks
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

router.get('/:id/tasks', async (req, res) => {
  return Projects.findById(req.params.id)
    .then((project) => {
      return project.getTasks({
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