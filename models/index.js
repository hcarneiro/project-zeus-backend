const _ = require('lodash');

const Models = {
  Users: require('./users'),
  Tasks: require('./tasks'),
  Projects: require('./projects')
};

Models.Projects.hasMany(Models.Tasks);
Models.Tasks.belongsTo(Models.Projects);

_.each(Models, function(model, name) {
  model.sync();
});