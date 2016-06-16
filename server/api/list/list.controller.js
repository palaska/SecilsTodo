/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/lists              ->  index
 * POST    /api/lists              ->  create
 * GET     /api/lists/:id          ->  show
 * PUT     /api/lists/:id          ->  update
 * DELETE  /api/lists/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var List = require('./list.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {

    _.forEach(updates, (val, key) => {
      if (_.isArray(val)) {
        entity[key] = val;
        delete updates[key];
        entity.markModified(key);
      }
    });
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Lists
exports.index = function(req, res) {
  List.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Gets a single List from the DB
exports.show = function(req, res) {
  List.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

exports.mine = function(req, res) {
  List.findAsync({ by: req.user._id })
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new List in the DB
exports.create = function(req, res) {
  const obj = req.body;
  obj.created_at = new Date();
  obj.tasks = [];
  obj.by = req.user._id;

  List.createAsync(obj)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
};

function checkHasRights(req, res) {
  return entity => {
    if (!entity && !entity.by) {
      res.status(400).end();
      return;
    }

    if (req.user.role === 'admin' || `${req.user._id}` === `${entity.by}`) {
      return entity;
    }

    res.status(401).end();
  }
}

// Updates an existing List in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  List.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(checkHasRights(req, res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a List from the DB
exports.destroy = function(req, res) {
  List.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(checkHasRights(req, res))
    .then(removeEntity(res))
    .catch(handleError(res));
};
