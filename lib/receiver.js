var ReadableStream = require('stream').Readable;
var redisEmitter = require('redis-eventemitter');
var util = require('util');
var asap = require('asap');
var url = require('url');
var debug = require('debug')('interprocess-push-stream:receiver');

util.inherits(InterprocessReceiver, ReadableStream);

function InterprocessReceiver(options) {
  if (!(this instanceof InterprocessReceiver))
    return new InterprocessReceiver(options);

  ReadableStream.call(this, {
    objectMode: true
  });

  var parsedUrl = url.parse(options.url || '');

  var source = redisEmitter({
    port: parsedUrl.port || 6379,
    host: parsedUrl.hostname || '127.0.0.1',
    prefix: options.prefix,
    auth_pass: (parsedUrl.auth ? parsedUrl.auth.split(":")[1] : null),
    pub: options.pub,
    sub: options.sub
  });

  this._source = source;
  this._dataEvent = options.channel;

  this._source.on(this._dataEvent, function(channel, data) {
    debug('channel:', channel, 'data:', data);
    asap(this.push.bind(this, data));
  }.bind(this));
}

InterprocessReceiver.prototype._read = function() {};

module.exports = InterprocessReceiver;
