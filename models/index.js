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
  Organization: require('./organization'),
  OrganizationRole: require('./organizationRole'),
  OrganizationUser: require('./organizationUser'),
  Session: require('./session'),
  User: require('./user'),
  UserRole: require('./userRole')
};

Models.TeamUser.belongsTo(Models.TeamRole, { foreignKey: 'teamRoleId' });
Models.Team.belongsToMany(Models.User, { through: Models.TeamUser });
Models.Team.belongsTo(Models.Organization, {
  foreignKey: {
    allowNull: true
  }
});

Models.User.belongsTo(Models.UserRole, { foreignKey: 'userRoleId' });
Models.User.belongsToMany(Models.Team, { through: Models.TeamUser });
Models.User.belongsToMany(Models.Organization, { through: Models.OrganizationUser });
Models.User.belongsToMany(Models.Project, { through: Models.ProjectUser });
Models.User.belongsToMany(Models.Task, { through: Models.TaskUser });
Models.User.hasMany(Models.Session, {
  onDelete: 'CASCADE'
});
Models.User.hasMany(Models.Project);
Models.User.hasMany(Models.Task);

Models.OrganizationUser.belongsTo(Models.OrganizationRole, { foreignKey: 'organizationRoleId' });
Models.Organization.belongsToMany(Models.User, { through: Models.OrganizationUser });
Models.Organization.hasMany(Models.Team);

Models.Task.belongsToMany(Models.User, { through: Models.TaskUser });
Models.Task.belongsTo(Models.Project);

Models.Project.belongsToMany(Models.User, { through: Models.ProjectUser });
Models.Project.belongsTo(Models.Team);
Models.Project.hasMany(Models.Task);

Models.Session.belongsTo(Models.User, {
  foreignKey: {
    allowNull: false
  },
  onDelete: 'cascade'
});

database.sync();
  // .then(function(){
  //   console.log('Syncronization complete. Creating organization roles...');
  //   return database.models.organizationRole.bulkCreate([
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
  //   return database.models.userRole.bulkCreate([
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
  //   return database.models.teamRole.bulkCreate([
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