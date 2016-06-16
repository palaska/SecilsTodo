/**
 * List model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var List = require('./list.model');
var ListEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ListEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  List.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ListEvents.emit(event + ':' + doc._id, doc);
    ListEvents.emit(event, doc);
  }
}

module.exports = ListEvents;
