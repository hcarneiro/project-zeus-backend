const casual = require('casual');
const _ = require('lodash');
const database = require('./database');

const authenticate = require('./authenticate');

// --------------------------------------------------------------------------

module.exports = function (preloaderName, req, res, id) {
  return new Promise(function (resolve) {
    module.exports[preloaderName](req, res, resolve, id);
  });
};

module.exports.param = function preloaderParam(paramName, preloaderName) {
  if (!module.exports[preloaderName]) {
    throw new Error(`${preloaderName} preloader not found`);
  }

  return function preloadParam(req, res, next) {
    var param = req.query[paramName] || req.body[paramName];

    if (param) {
      return module.exports[preloaderName](req, res, next, param);
    }

    next();
  };
};

module.exports.organization = function preloaderOrganization(req, res, next, id) {
  if (!id && req.nextPreloaderIsOptional) {
    delete req.nextPreloaderIsOptional;
    return next();
  }
  
  if (isNaN(id)) {
    return res.error(400, 'ID is not valid');
  }

  if (req.pzOrganization && req.pzOrganization.id === id) {
    return next(); // already loaded with the same id
  }

  if (req.query.development) {
    req.pzOrganization = database.db.models.organization.build({
      id,
      name: casual.title
    });

    return next();
  }

  if (req.admin) {
    return database.db.models.organization.findById(id)
      .then(function (organization) {
        if (!organization) {
          return res.error(404, 'The organization does not exist');
        }

        req.pzOrganization = organization;
        next();
      });
  }

  if (!req.user) {
    return res.status(400).send({ error: 'Authentication is required to access organizations' });
  }

  let attributes = ['id', 'name', 'settings', 'type', 'legacyId', 'encryptionKey', 'policy'];

  if (req.path.indexOf(`organizations/${id}/credentials`) !== -1) {
    attributes = undefined; // load everything in the model
  }

  req.user.getOrganizations({
    where: {
      id
    },
    attributes
  }).then(function onGetOrganization(organizations) {
    if (organizations.length) {
      return Promise.resolve(organizations[0]);
    }

    if (!req.allowOrganizationAppRole) {
      return Promise.reject();
    }

    return req.user.getApps({
      where: { organizationId: id },
      attributes: ['organizationId'],
      raw: true,
      limit: 1
    }).then(function (apps) {
      if (!apps.length) {
        return Promise.reject();
      }

      return database.db.models.organization.findOne({
        where: { id }
      }).then(function (organization) {
        return organization ? Promise.resolve(organization) : Promise.reject();
      });
    });
  }).then(function onOrganizationLoaded(organization) {
    req.pzOrganization = organization;
    next();
  }).catch(function () {
    if (req.nextPreloaderIsOptional === true) {
      delete req.nextPreloaderIsOptional;
      return next();
    }

    res.status(404).format({
      'application/json': function(){
        res.send({
          error: 'Organisation not found or missing user role'
        });
      },
      'text/html': function() {
        res.send([
          '<h1>You cannot access this organisation</h1>',
          '<p>The organization you\'re trying to access to does not exist,',
          'or you might not have the correct rights to access this resource. ',
          `Please make sure you belong to the organisation #${id} before accessing `,
          'this page.</p><p>If you need more help, please get in touch with our ',
          'support team.</p>'
        ].join('\r\n'));
      }
    });
  });
};

module.exports.organizationUser = function (req, res, next, id) {
  if (!req.pzOrganization) {
    return next('Organization is required to load a user.');
  }

  req.pzOrganization.getUsers({
    where: { id },
    limit: 1
  }).then(function (users) {
    if (!users.length) {
      return res.status(404).send({ message: 'User or role not found' });
    }

    req.pzOrganizationUser = users[0];
    next();
  });
};

module.exports.user = function (req, res, next, id) {
  if (!req.admin) {
    return next('User can only be loaded on admin endpoints.');
  }

  const where = isNaN(id) ? { email: id.trim().toLowerCase() } : { id: parseInt(id, 10) };

  database.db.models.user.findOne({
    where,
    attributes: ['id', 'email', 'firstName', 'lastName']
  }).then(function (user) {
    if (!user) {
      return res.error(404, 'User not found');
    }

    req.flUser = user;
    next();
  }).catch(res.error(500));
};