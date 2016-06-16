'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var ListSchema = new Schema({
  title: String,
  created_at: Date,
  tasks: [{
    text: String,
    done: {
      type: Boolean,
      default: false
    }
  }],
  by: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('List', ListSchema);
