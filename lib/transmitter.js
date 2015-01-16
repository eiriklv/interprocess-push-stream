var WritableStream = require('stream').Writable;
var redisEmitter = require('redis-eventemitter');
var util = require('util');
var asap = require('asap');
var debug = require('debug')('interprocess-push-stream:transmitter');

util.inherits(InterprocessTransmitter, WritableStream);

function InterprocessTransmitter(options) {
  if (!(this instanceof InterprocessTransmitter))
    return new InterprocessTransmitter(options);

  WritableStream.call(this, {
    objectMode: true
  });

  var source = redisEmitter({
    port: options.port || 6379,
    host: options.host || '127.0.0.1',
    prefix: options.prefix,
    auth_pass: options.auth || null,
    pub: options.pub,
    sub: options.sub
  });

  this._source = source;
  this._dataEvent = options.channel;
}

InterprocessTransmitter.prototype._write = function(chunk, encoding, done) {
  asap(function() {
    this._source.emit(this._dataEvent, chunk);
    done();
  }.bind(this));
};

module.exports = InterprocessTransmitter;
