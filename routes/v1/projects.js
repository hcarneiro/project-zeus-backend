const express = require('express');
const router = express.Router();
const database = require('../../libs/database');
const authenticate = require('../../libs/authenticate');

router.use(authenticate);

router.get('/', async (req, res) => {
  const projects = await req.user.getProjects({
    include: [{
      model: database.db.models.task
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
  database.db.models.project.findById(req.params.id)
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

router.post('/', (req, res) => {
  let projectResponse;
  database.db.models.project.create(req.body)
    .then((project) => {
      projectResponse = project
      return project.addUser(req.user);
    }).then(() => {
      res.send(projectResponse);
    })
    .catch((error) => {
      res.status(500).send(error)
    });
});

module.exports = router;