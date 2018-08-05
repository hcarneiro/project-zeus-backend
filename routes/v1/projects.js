const express = require('express');
const router = express.Router();
const Project = require('../../models/project');
const Task = require('../../models/task');

router.get('/', async (req, res) => {
  const projects = await Project.findAll({
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
  const project = await Project.findOne({
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
  return Project.findById(req.params.id)
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