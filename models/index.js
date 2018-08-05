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

Models.TeamUser.belongsTo(Models.TeamRole, {});
Models.Team.belongsToMany(Models.User, { through: Models.TeamUser });
Models.Team.belongsTo(Models.Organization, {
  foreignKey: {
    allowNull: true
  }
});

Models.Task.belongsToMany(Models.User, { through: Models.TaskUser });
Models.Task.belongsTo(Models.Project);

Models.Project.belongsToMany(Models.User, { through: Models.ProjectUser });
Models.Project.belongsTo(Models.Team, {});
Models.Project.hasMany(Models.Task);

Models.Organization.belongsToMany(Models.User, { through: Models.OrganizationUser });
Models.OrganizationUser.belongsTo(Models.OrganizationRole, {});
Models.Organization.hasMany(Models.Team);

Models.Session.belongsTo(Models.User, {
  foreignKey: {
    allowNull: false
  },
  onDelete: 'cascade'
});

Models.User.belongsToMany(Models.Team, { through: Models.TeamUser });
Models.User.belongsToMany(Models.Organization, { through: Models.OrganizationUser });
Models.User.belongsTo(Models.UserRole);
Models.User.hasMany(Models.Session, {
  onDelete: 'CASCADE'
});
Models.User.hasMany(Models.Project);
Models.User.hasMany(Models.Task);

database.sync();