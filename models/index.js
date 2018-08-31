const _ = require('lodash');
const database = require('../libs/database');

const Models = {
  Team: require('./team'),
  TeamRole: require('./teamRole'),
  TeamUser: require('./teamUser'),
  Task: require('./task'),
  TaskUser: require('./taskUser'),
  Project: require('./project'),
  ProjectUser: require('./projectUser'),
  ProjectTask: require('./projectTask'),
  ProjectTeam: require('./projectTeam'),
  Organization: require('./organization'),
  OrganizationRole: require('./organizationRole'),
  OrganizationUser: require('./organizationUser'),
  OrganizationTeam: require('./organizationTeam'),
  Session: require('./session'),
  User: require('./user'),
  UserRole: require('./userRole')
};

Models.TeamUser.belongsTo(Models.TeamRole, { foreignKey: 'teamRoleId' });
Models.Team.belongsToMany(Models.User, { through: Models.TeamUser });
Models.Team.belongsTo(Models.Organization, { through: Models.OrganizationTeam });

Models.User.belongsTo(Models.UserRole, { foreignKey: 'userRoleId' });
Models.User.belongsToMany(Models.Team, { through: Models.TeamUser });
Models.User.belongsToMany(Models.Organization, { through: Models.OrganizationUser });
Models.User.belongsToMany(Models.Project, { through: Models.ProjectUser });
Models.User.belongsToMany(Models.Task, { through: Models.TaskUser });
Models.User.hasMany(Models.Session, {
  onDelete: 'CASCADE'
});

Models.OrganizationUser.belongsTo(Models.OrganizationRole, { foreignKey: 'organizationRoleId' });
Models.Organization.belongsToMany(Models.User, { through: Models.OrganizationUser });
Models.Organization.belongsToMany(Models.Team, { through: Models.OrganizationTeam });

Models.Task.belongsToMany(Models.Project, { through: Models.ProjectTask });
Models.Task.belongsToMany(Models.User, { through: Models.TaskUser });

Models.Project.belongsToMany(Models.User, { through: Models.ProjectUser });
Models.Project.belongsToMany(Models.Team, { through: Models.ProjectTeam });
Models.Project.belongsToMany(Models.Task, { through: Models.ProjectTask });

Models.Session.belongsTo(Models.User, {
  foreignKey: {
    allowNull: false
  },
  onDelete: 'cascade'
});

database.db.sync();
  // .then(function(){
  //   console.log('Syncronization complete. Creating organization roles...');
  //   return database.db.models.organizationRole.bulkCreate([
  //     {
  //       "id": 1,
  //       "role": "admin"
  //     },
  //     {
  //       "id": 2,
  //       "role": "standard"
  //     }
  //   ]);
  // }).then(function () {
  //   console.log('Organization roles created. Creating user roles...');
  //   return database.db.models.userRole.bulkCreate([
  //     {
  //       "id": 1,
  //       "role": "admin"
  //     },
  //     {
  //       "id": 2,
  //       "role": "standard"
  //     }
  //   ]);
  // }).then(function () {
  //   console.log('User roles created. Creating team roles...');
  //   return database.db.models.teamRole.bulkCreate([
  //     {
  //       "id": 1,
  //       "role": "owner"
  //     },
  //     {
  //       "id": 2,
  //       "role": "standard"
  //     }
  //   ]);
  // }).then(function () {
  //   console.log('Team roles created. Migration completed.');
  //   return Promise.resolve();
  // });