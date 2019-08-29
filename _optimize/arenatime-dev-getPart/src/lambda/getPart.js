(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.handler = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const aws = require("aws-sdk");
const client_1 = require("./lib/client");
const request_1 = require("./lib/request");
__export(require("./lib/client"));
class Athena {
}
Athena.createClient = createClient;
Athena.setConcurrentExecMax = client_1.setConcurrentExecMax;
exports.default = Athena;
function createClient(clientConfig, awsConfig) {
    if (clientConfig === undefined ||
        clientConfig.bucketUri === undefined ||
        clientConfig.bucketUri.length === 0) {
        throw new Error('bucket uri required');
    }
    if (awsConfig === undefined ||
        awsConfig.region === undefined ||
        awsConfig.region.length === 0) {
        throw new Error('region required');
    }
    aws.config.update(awsConfig);
    const athena = new aws.Athena({ apiVersion: '2017-05-18' });
    const s3 = new aws.S3({ apiVersion: '2006-03-01' });
    const request = new request_1.AthenaRequest(athena, s3);
    return new client_1.AthenaClient(request, clientConfig);
}
exports.createClient = createClient;

},{"./lib/client":2,"./lib/request":3,"aws-sdk":undefined}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv = require("csv-parser");
const timers_1 = require("timers");
const util = require("./util");
const defaultPollingInterval = 1000;
const defaultQueryTimeout = 0;
const defaultExecRightCheckInterval = 100;
let concurrentExecMax = 5;
let concurrentExecNum = 0;
function setConcurrentExecMax(val) {
    concurrentExecMax = val;
}
exports.setConcurrentExecMax = setConcurrentExecMax;
class AthenaClient {
    constructor(request, config) {
        this.request = request;
        this.config = config;
        if (config.concurrentExecMax) {
            console.warn(`[WARN] please use 'athena.setConcurrentExecMax()' instead 'clientConfig.concurrentExecMax'`);
            concurrentExecMax = config.concurrentExecMax;
        }
        if ((config.encryptionOption === 'SSE_KMS' ||
            config.encryptionOption === 'CSE_KMS') &&
            config.encryptionKmsKey === undefined) {
            throw new Error('KMS key required');
        }
    }
    execute(query, callback) {
        const currentConfig = Object.assign({}, this.config);
        const csvTransform = new csv();
        this._execute(query, csvTransform, currentConfig);
        if (callback !== undefined) {
            let isEnd = false;
            const records = [];
            let queryExecution;
            csvTransform.on('data', (record) => {
                records.push(record);
            });
            csvTransform.on('query_end', (q) => {
                queryExecution = q;
            });
            csvTransform.on('end', (record) => {
                if (isEnd) {
                    return;
                }
                const result = {
                    records,
                    queryExecution,
                };
                callback(undefined, result);
            });
            csvTransform.on('error', (err) => {
                isEnd = true;
                callback(err);
            });
            return;
        }
        else {
            return {
                toPromise: () => {
                    return new Promise((resolve, reject) => {
                        const records = [];
                        let queryExecution;
                        csvTransform.on('data', (record) => {
                            records.push(record);
                        });
                        csvTransform.on('query_end', (q) => {
                            queryExecution = q;
                        });
                        csvTransform.on('end', (record) => {
                            const result = {
                                records,
                                queryExecution,
                            };
                            return resolve(result);
                        });
                        csvTransform.on('error', (err) => {
                            return reject(err);
                        });
                    });
                },
                toStream: () => {
                    return csvTransform;
                },
            };
        }
    }
    _execute(query, csvTransform, config) {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this.canStartQuery()) {
                yield util.sleep(config.execRightCheckInterval || defaultExecRightCheckInterval);
            }
            let queryExecution;
            try {
                this.startQuery();
                const queryId = yield this.request.startQuery(query, config);
                let isTimeout = false;
                if ((config.queryTimeout || defaultQueryTimeout) !== 0) {
                    timers_1.setTimeout(() => {
                        isTimeout = true;
                    }, config.queryTimeout || defaultQueryTimeout);
                }
                while (!isTimeout && !(yield this.request.checkQuery(queryId, config))) {
                    yield util.sleep(config.pollingInterval || defaultPollingInterval);
                }
                if (isTimeout) {
                    yield this.request.stopQuery(queryId, config);
                    throw new Error('query timeout');
                }
                queryExecution = yield this.request.getQueryExecution(queryId, config);
                csvTransform.emit('query_end', queryExecution);
                this.endQuery();
            }
            catch (err) {
                this.endQuery();
                csvTransform.emit('error', err);
                return;
            }
            if (config.skipFetchResult) {
                csvTransform.end();
                return;
            }
            else {
                try {
                    if (!queryExecution.ResultConfiguration ||
                        !queryExecution.ResultConfiguration.OutputLocation) {
                        throw new Error('query outputlocation is empty');
                    }
                    const resultsStream = this.request.getResultsStream(queryExecution.ResultConfiguration.OutputLocation);
                    resultsStream.pipe(csvTransform);
                }
                catch (err) {
                    csvTransform.emit('error', err);
                    return;
                }
            }
        });
    }
    canStartQuery() {
        return concurrentExecNum < concurrentExecMax;
    }
    startQuery() {
        concurrentExecNum = Math.min(++concurrentExecNum, concurrentExecMax);
    }
    endQuery() {
        concurrentExecNum = Math.max(--concurrentExecNum, 0);
    }
}
exports.AthenaClient = AthenaClient;

},{"./util":4,"csv-parser":9,"timers":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultBaseRetryWait = 200;
const defaultRetryWaitMax = 10000;
const defaultRetryCountMax = 10;
class AthenaRequest {
    constructor(athena, s3) {
        this.athena = athena;
        this.s3 = s3;
    }
    startQuery(query, config) {
        return new Promise((resolve, reject) => {
            let retryCount = 0;
            const params = {
                QueryString: query,
                ResultConfiguration: Object.assign({ OutputLocation: config.bucketUri }, (config.encryptionOption && {
                    EncryptionConfiguration: Object.assign({ EncryptionOption: config.encryptionOption }, (config.encryptionKmsKey && {
                        KmsKey: config.encryptionKmsKey,
                    })),
                })),
                QueryExecutionContext: {
                    Database: config.database || 'default',
                },
                WorkGroup: config.workGroup || 'primary',
            };
            const loopFunc = () => {
                this.athena.startQueryExecution(params, (err, data) => {
                    if (err && isRetryException(err) && canRetry(retryCount, config)) {
                        let wait = (config.baseRetryWait || defaultBaseRetryWait) *
                            Math.pow(2, retryCount++);
                        wait = Math.min(wait, config.retryWaitMax || defaultRetryWaitMax);
                        return setTimeout(loopFunc, wait);
                    }
                    else if (err) {
                        return reject(err);
                    }
                    return resolve(data.QueryExecutionId);
                });
            };
            loopFunc();
        });
    }
    checkQuery(queryId, config) {
        return new Promise((resolve, reject) => {
            this.getQueryExecution(queryId, config)
                .then((queryExecution) => {
                const state = queryExecution.Status.State;
                let isSucceed = false;
                let error = null;
                switch (state) {
                    case 'QUEUED':
                    case 'RUNNING':
                        isSucceed = false;
                        break;
                    case 'SUCCEEDED':
                        isSucceed = true;
                        break;
                    case 'FAILED':
                        isSucceed = false;
                        const errMsg = queryExecution.Status.StateChangeReason ||
                            'FAILED: Execution Error';
                        error = new Error(errMsg);
                        break;
                    case 'CANCELLED':
                        isSucceed = false;
                        error = new Error('FAILED: Query CANCELLED');
                        break;
                    default:
                        isSucceed = false;
                        error = new Error(`FAILED: UnKnown State ${state}`);
                }
                if (error) {
                    return reject(error);
                }
                return resolve(isSucceed);
            })
                .catch((err) => {
                return reject(err);
            });
        });
    }
    stopQuery(queryId, config) {
        return new Promise((resolve, reject) => {
            let retryCount = 0;
            const params = {
                QueryExecutionId: queryId,
            };
            const loopFunc = () => {
                this.athena.stopQueryExecution(params, (err) => {
                    if (err && isRetryException(err) && canRetry(retryCount, config)) {
                        const wait = Math.pow(config.baseRetryWait || defaultBaseRetryWait, retryCount++);
                        return setTimeout(loopFunc, wait);
                    }
                    else if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            };
            loopFunc();
        });
    }
    getQueryExecution(queryId, config) {
        return new Promise((resolve, reject) => {
            let retryCount = 0;
            const params = {
                QueryExecutionId: queryId,
            };
            const loopFunc = () => {
                this.athena.getQueryExecution(params, (err, data) => {
                    if (err && isRetryException(err) && canRetry(retryCount, config)) {
                        const wait = Math.pow(config.baseRetryWait || defaultBaseRetryWait, retryCount++);
                        return setTimeout(loopFunc, wait);
                    }
                    else if (err) {
                        return reject(err);
                    }
                    return resolve(data.QueryExecution);
                });
            };
            loopFunc();
        });
    }
    getResultsStream(s3Uri) {
        const arr = s3Uri.replace('s3://', '').split('/');
        const bucket = arr.shift() || '';
        const key = arr.join('/');
        return this.s3
            .getObject({
            Bucket: bucket,
            Key: key,
        })
            .createReadStream();
    }
}
exports.AthenaRequest = AthenaRequest;
function isRetryException(err) {
    return (err.code === 'ThrottlingException' ||
        err.code === 'TooManyRequestsException' ||
        err.message === 'Query exhausted resources at this scale factor');
}
function canRetry(retryCount, config) {
    return retryCount < (config.retryCountMax || defaultRetryCountMax);
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timers_1 = require("timers");
function sleep(ms) {
    return new Promise((resolve) => {
        timers_1.setTimeout(() => {
            resolve();
        }, ms);
    });
}
exports.sleep = sleep;

},{"timers":undefined}],5:[function(require,module,exports){
function allocUnsafe (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }

  if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }

  if (Buffer.allocUnsafe) {
    return Buffer.allocUnsafe(size)
  } else {
    return new Buffer(size)
  }
}

module.exports = allocUnsafe

},{}],6:[function(require,module,exports){
var bufferFill = require('buffer-fill')
var allocUnsafe = require('buffer-alloc-unsafe')

module.exports = function alloc (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }

  if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }

  if (Buffer.alloc) {
    return Buffer.alloc(size, fill, encoding)
  }

  var buffer = allocUnsafe(size)

  if (size === 0) {
    return buffer
  }

  if (fill === undefined) {
    return bufferFill(buffer, 0)
  }

  if (typeof encoding !== 'string') {
    encoding = undefined
  }

  return bufferFill(buffer, fill, encoding)
}

},{"buffer-alloc-unsafe":5,"buffer-fill":7}],7:[function(require,module,exports){
/* Node.js 6.4.0 and up has full support */
var hasFullSupport = (function () {
  try {
    if (!Buffer.isEncoding('latin1')) {
      return false
    }

    var buf = Buffer.alloc ? Buffer.alloc(4) : new Buffer(4)

    buf.fill('ab', 'ucs2')

    return (buf.toString('hex') === '61006200')
  } catch (_) {
    return false
  }
}())

function isSingleByte (val) {
  return (val.length === 1 && val.charCodeAt(0) < 256)
}

function fillWithNumber (buffer, val, start, end) {
  if (start < 0 || end > buffer.length) {
    throw new RangeError('Out of range index')
  }

  start = start >>> 0
  end = end === undefined ? buffer.length : end >>> 0

  if (end > start) {
    buffer.fill(val, start, end)
  }

  return buffer
}

function fillWithBuffer (buffer, val, start, end) {
  if (start < 0 || end > buffer.length) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return buffer
  }

  start = start >>> 0
  end = end === undefined ? buffer.length : end >>> 0

  var pos = start
  var len = val.length
  while (pos <= (end - len)) {
    val.copy(buffer, pos)
    pos += len
  }

  if (pos !== end) {
    val.copy(buffer, pos, 0, end - pos)
  }

  return buffer
}

function fill (buffer, val, start, end, encoding) {
  if (hasFullSupport) {
    return buffer.fill(val, start, end, encoding)
  }

  if (typeof val === 'number') {
    return fillWithNumber(buffer, val, start, end)
  }

  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = buffer.length
    } else if (typeof end === 'string') {
      encoding = end
      end = buffer.length
    }

    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }

    if (encoding === 'latin1') {
      encoding = 'binary'
    }

    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }

    if (val === '') {
      return fillWithNumber(buffer, 0, start, end)
    }

    if (isSingleByte(val)) {
      return fillWithNumber(buffer, val.charCodeAt(0), start, end)
    }

    val = new Buffer(val, encoding)
  }

  if (Buffer.isBuffer(val)) {
    return fillWithBuffer(buffer, val, start, end)
  }

  // Other values (e.g. undefined, boolean, object) results in zero-fill
  return fillWithNumber(buffer, 0, start, end)
}

module.exports = fill

},{}],8:[function(require,module,exports){
var toString = Object.prototype.toString

var isModern = (
  typeof Buffer.alloc === 'function' &&
  typeof Buffer.allocUnsafe === 'function' &&
  typeof Buffer.from === 'function'
)

function isArrayBuffer (input) {
  return toString.call(input).slice(8, -1) === 'ArrayBuffer'
}

function fromArrayBuffer (obj, byteOffset, length) {
  byteOffset >>>= 0

  var maxLength = obj.byteLength - byteOffset

  if (maxLength < 0) {
    throw new RangeError("'offset' is out of bounds")
  }

  if (length === undefined) {
    length = maxLength
  } else {
    length >>>= 0

    if (length > maxLength) {
      throw new RangeError("'length' is out of bounds")
    }
  }

  return isModern
    ? Buffer.from(obj.slice(byteOffset, byteOffset + length))
    : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)))
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  return isModern
    ? Buffer.from(string, encoding)
    : new Buffer(string, encoding)
}

function bufferFrom (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return isModern
    ? Buffer.from(value)
    : new Buffer(value)
}

module.exports = bufferFrom

},{}],9:[function(require,module,exports){
var stream = require('stream')
var inherits = require('inherits')
var genobj = require('generate-object-property')
var genfun = require('generate-function')
var bufferFrom = require('buffer-from')
var bufferAlloc = require('buffer-alloc')

var quote = bufferFrom('"')[0]
var comma = bufferFrom(',')[0]
var cr = bufferFrom('\r')[0]
var nl = bufferFrom('\n')[0]

var Parser = function (opts) {
  if (!opts) opts = {}
  if (Array.isArray(opts)) opts = {headers: opts}

  stream.Transform.call(this, {objectMode: true, highWaterMark: 16})

  this.separator = opts.separator ? bufferFrom(opts.separator)[0] : comma
  this.quote = opts.quote ? bufferFrom(opts.quote)[0] : quote
  this.escape = opts.escape ? bufferFrom(opts.escape)[0] : this.quote
  if (opts.newline) {
    this.newline = bufferFrom(opts.newline)[0]
    this.customNewline = true
  } else {
    this.newline = nl
    this.customNewline = false
  }

  this.headers = opts.headers || null
  this.strict = opts.strict || null
  this.mapHeaders = opts.mapHeaders || identity
  this.mapValues = opts.mapValues || identity

  this._raw = !!opts.raw
  this._prev = null
  this._prevEnd = 0
  this._first = true
  this._quoted = false
  this._escaped = false
  this._empty = this._raw ? bufferAlloc(0) : ''
  this._Row = null

  if (this.headers) {
    this._first = false
    this._compile(this.headers)
  }
}

inherits(Parser, stream.Transform)

Parser.prototype._transform = function (data, enc, cb) {
  if (typeof data === 'string') data = bufferFrom(data)

  var start = 0
  var buf = data

  if (this._prev) {
    start = this._prev.length
    buf = Buffer.concat([this._prev, data])
    this._prev = null
  }

  var bufLen = buf.length

  for (var i = start; i < bufLen; i++) {
    var chr = buf[i]
    var nextChr = i + 1 < bufLen ? buf[i + 1] : null

    if (!this._escaped && chr === this.escape && nextChr === this.quote && i !== start) {
      this._escaped = true
      continue
    } else if (chr === this.quote) {
      if (this._escaped) {
        this._escaped = false
      // non-escaped quote (quoting the cell)
      } else {
        this._quoted = !this._quoted
      }
      continue
    }

    if (!this._quoted) {
      if (this._first && !this.customNewline) {
        if (chr === nl) {
          this.newline = nl
        } else if (chr === cr) {
          if (nextChr !== nl) {
            this.newline = cr
          }
        }
      }

      if (chr === this.newline) {
        this._online(buf, this._prevEnd, i + 1)
        this._prevEnd = i + 1
      }
    }
  }

  if (this._prevEnd === bufLen) {
    this._prevEnd = 0
    return cb()
  }

  if (bufLen - this._prevEnd < data.length) {
    this._prev = data
    this._prevEnd -= (bufLen - data.length)
    return cb()
  }

  this._prev = buf
  cb()
}

Parser.prototype._flush = function (cb) {
  if (this._escaped || !this._prev) return cb()
  this._online(this._prev, this._prevEnd, this._prev.length + 1) // plus since online -1s
  cb()
}

Parser.prototype._online = function (buf, start, end) {
  end-- // trim newline
  if (!this.customNewline && buf.length && buf[end - 1] === cr) end--

  var comma = this.separator
  var cells = []
  var isQuoted = false
  var offset = start

  for (var i = start; i < end; i++) {
    var isStartingQuote = !isQuoted && buf[i] === this.quote
    var isEndingQuote = isQuoted && buf[i] === this.quote && i + 1 <= end && buf[i + 1] === comma
    var isEscape = isQuoted && buf[i] === this.escape && i + 1 < end && buf[i + 1] === this.quote

    if (isStartingQuote || isEndingQuote) {
      isQuoted = !isQuoted
      continue
    } else if (isEscape) {
      i++
      continue
    }

    if (buf[i] === comma && !isQuoted) {
      cells.push(this._oncell(buf, offset, i))
      offset = i + 1
    }
  }

  if (offset < end) cells.push(this._oncell(buf, offset, end))
  if (buf[end - 1] === comma) cells.push(this._empty)

  if (this._first) {
    this._first = false
    this.headers = cells
    this._compile(cells)
    this.emit('headers', this.headers)
    return
  }

  if (this.strict && cells.length !== this.headers.length) {
    this.emit('error', new Error('Row length does not match headers'))
  } else {
    this._emit(this._Row, cells)
  }
}

Parser.prototype._compile = function () {
  if (this._Row) return

  var Row = genfun()('function Row (cells) {')

  var self = this
  this.headers.forEach(function (cell, i) {
    var newHeader = self.mapHeaders(cell, i)
    if (newHeader) {
      Row('%s = cells[%d]', genobj('this', newHeader), i)
    }
  })

  Row('}')

  this._Row = Row.toFunction()

  if (Object.defineProperty) {
    Object.defineProperty(this._Row.prototype, 'headers', {
      enumerable: false,
      value: this.headers
    })
  } else {
    this._Row.prototype.headers = this.headers
  }
}

Parser.prototype._emit = function (Row, cells) {
  this.push(new Row(cells))
}

Parser.prototype._oncell = function (buf, start, end) {
  // remove quotes from quoted cells
  if (buf[start] === this.quote && buf[end - 1] === this.quote) {
    start++
    end--
  }

  for (var i = start, y = start; i < end; i++) {
    // check for escape characters and skip them
    if (buf[i] === this.escape && i + 1 < end && buf[i + 1] === this.quote) i++
    if (y !== i) buf[y] = buf[i]
    y++
  }

  var value = this._onvalue(buf, start, y)
  return this._first ? value : this.mapValues(value)
}

Parser.prototype._onvalue = function (buf, start, end) {
  if (this._raw) return buf.slice(start, end)
  return buf.toString('utf-8', start, end)
}

function identity (id) {
  return id
}

module.exports = function (opts) {
  return new Parser(opts)
}

},{"buffer-alloc":6,"buffer-from":8,"generate-function":10,"generate-object-property":11,"inherits":12,"stream":undefined}],10:[function(require,module,exports){
var util = require('util')

var last = function(str) {
  str = str.trim()
  return str[str.length-1]
}

var first = function(str) {
  return str.trim()[0]
}

var notEmpty = function(line) {
  return line.trim()
}

var notEmptyElse = function() {
  var notNext = false
  return function(line, i, lines) {
    if (notNext) {
      notNext = false
      return ''
    }
    if (lines[i].trim() === '} else {' && (lines[i+1] || '').trim() === '}') {
      notNext = true
      return lines[i].replace('} else {', '}')
    }
    return line
  }
}

module.exports = function() {
  var lines = []
  var indent = 0

  var push = function(str) {
    var spaces = ''
    while (spaces.length < indent*2) spaces += '  '
    lines.push(spaces+str)
  }

  var line = function(fmt) {
    if (!fmt) return line

    if (fmt.trim()[0] === '}' && fmt[fmt.length-1] === '{') {
      indent--
      push(util.format.apply(util, arguments))
      indent++
      return line
    }
    if (fmt[fmt.length-1] === '{') {
      push(util.format.apply(util, arguments))
      indent++
      return line
    }
    if (fmt.trim()[0] === '}') {
      indent--
      push(util.format.apply(util, arguments))
      return line
    }

    push(util.format.apply(util, arguments))
    return line
  }

  line.trim = function() {
    lines = lines
      .filter(notEmpty)
      .map(notEmptyElse())
      .filter(notEmpty)
    return line
  }

  line.toString = function() {
    return lines.join('\n')
  }

  line.toFunction = function(scope) {
    var src = 'return ('+line.toString()+')'

    var keys = Object.keys(scope || {}).map(function(key) {
      return key
    })

    var vals = keys.map(function(key) {
      return scope[key]
    })

    return Function.apply(null, keys.concat(src)).apply(null, vals)
  }

  if (arguments.length) line.apply(null, arguments)

  return line
}

},{"util":undefined}],11:[function(require,module,exports){
var isProperty = require('is-property')

var gen = function(obj, prop) {
  return isProperty(prop) ? obj+'.'+prop : obj+'['+JSON.stringify(prop)+']'
}

gen.valid = isProperty
gen.property = function (prop) {
 return isProperty(prop) ? prop : JSON.stringify(prop)
}

module.exports = gen

},{"is-property":16}],12:[function(require,module,exports){
try {
  var util = require('util');
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = require('./inherits_browser.js');
}

},{"./inherits_browser.js":13,"util":undefined}],13:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],14:[function(require,module,exports){
'use strict';
var numberIsNan = require('number-is-nan');

module.exports = Number.isFinite || function (val) {
	return !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity);
};

},{"number-is-nan":19}],15:[function(require,module,exports){
'use strict';

var numberIsInteger = require('number-is-integer');

function isPrime (n) {
  if(n === 1) {
    return false
  }
  if (n === 2 || n === 3) {
    return true;
  }
  else if ( (n % 2 === 0) || (n % 3 === 0) ){
    return false;
  }
  else {
    var p=5;
    var w=2;
    while ( p * p <= n ){
      if (n % p === 0) { return false; }
      p += w;
      w = 6 - w;
    }
    return true;
  }
}

module.exports = function (n) {
  if (typeof n !== 'number') {
    throw new TypeError('Expected a number');
  }
  if(n<=0) {
    throw new Error('The number must be a positive integer');
  }
  if(!numberIsInteger(n)){
    throw new Error('The number must be a integer');
  }
  return isPrime(n);
};

},{"number-is-integer":18}],16:[function(require,module,exports){
"use strict"
function isProperty(str) {
  return /^[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/.test(str)
}
module.exports = isProperty
},{}],17:[function(require,module,exports){
var isPrime = require('is-prime');

module.exports = function(n) {
	var position = 1;
	
	if(n==1){
		return 2;
	}
	
	return checkIfIsPrime(position, n);
}
	
function checkIfIsPrime(position, n){
	for(var i=3;;i+=2){
		var prime = isPrime(i);
		position = incrementPosition(prime, position);
		if(prime && position == n){
			return i;
		}
	}
}

function incrementPosition(prime, position){
	return prime? ++position : position;
}

},{"is-prime":15}],18:[function(require,module,exports){
'use strict';
var numberIsFinite = require('is-finite');

module.exports = Number.isInteger || function (x) {
	return numberIsFinite(x) && Math.floor(x) === x;
};

},{"is-finite":14}],19:[function(require,module,exports){
'use strict';
module.exports = Number.isNaN || function (x) {
	return x !== x;
};

},{}],20:[function(require,module,exports){
"use strict";const aws=require("aws-sdk"),dyn=new aws.DynamoDB,athenaClient=require("athena-client"),primeChar=require("../util/prime").prime;function setId(req){let id=1;for(let tmp in req.deck)id*=primeChar[req.deck[tmp]];return id===NaN?1:id}var clientConfig={bucketUri:"s3://aws-athena-query-results-527044138162-ap-northeast-2/",database:"aggregated"},awsConfig={region:"ap-northeast-2"};const athena=athenaClient.createClient(clientConfig,awsConfig);module.exports.handler=async(event,context)=>{let req=JSON.parse(event.queryStringParameters[0]),count=0;for(let c in req.deck)count+=1;if("defense"!==req.deckType&&"attack"!==req.deckType||"attackWin"!==req.matchResult&&"defenseWin"!==req.matchResult&&"all"!==req.matchResult||"all"!==req.arena&&"battleArena"!==req.arena&&"princessArena"!==req.arena||3<count&&2>count){let result={statusCode:400,body:JSON.stringify({message:"Parsing Failed",runtime:err})};return result}let queryString="",id=setId(req);"defense"===req.deckType&&2===count?queryString="select matchid from matches where contains(defenseduo, "+id+") and arena <> '"+req.arena+"' and matchresult <> '"+req.matchResult+"' limit 50":"defense"===req.deckType&&3===count?queryString="select matchid from matches where contains(defensetrio, "+id+") and arena <> '"+req.arena+"' and matchresult <> '"+req.matchResult+"' limit 50":"attack"===req.deckType&&2===count?queryString="select matchid from matches where contains(attackduo, "+id+") and arena <> '"+req.arena+"' and matchresult <> '"+req.matchResult+"' limit 50":"attack"===req.deckType&&3===count&&(queryString="select matchid from matches where contains(attacktrio, "+id+") and arena <> '"+req.arena+"' and matchresult <> '"+req.matchResult+"' limit 50");let query;try{query=await athena.execute(queryString).toPromise()}catch(err){let result={statusCode:400,body:JSON.stringify({message:"Query Failed",runtime:err}),headers:{"Access-Control-Allow-Origin":"https://stdev17.github.io","Access-Control-Allow-Credentials":!0}};return result}let queries=query.records,matches=[],error=!1;for(let m in queries){let params={TableName:"match-table",ProjectionExpression:"attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments",Key:{matchId:{S:queries[m].matchid}}},nothing=await dyn.getItem(params).promise().then(data=>{void 0!==data.Item&&void 0!==data.Item.attackDeck&&matches.push(data.Item)}).catch(()=>{error=!0})}if(error){let result={statusCode:400,body:JSON.stringify({message:"Getting Items Failed",runtime:context}),headers:{"Access-Control-Allow-Origin":"https://stdev17.github.io","Access-Control-Allow-Credentials":!0}};return result}else{let result={statusCode:200,body:JSON.stringify({message:matches,runtime:context}),headers:{"Access-Control-Allow-Origin":"https://stdev17.github.io","Access-Control-Allow-Credentials":!0}};return result}};

},{"../util/prime":21,"athena-client":1,"aws-sdk":undefined}],21:[function(require,module,exports){
"use strict";var prime=require("nth-prime"),primeChar={Rima:prime(1),Miyako:prime(2),Kuuka:prime(3),Jyun:prime(4),Kaori:prime(6),Pekorinne:prime(8),Nozomi:prime(10),Makoto:prime(12),Akino:prime(15),Tsumugi:prime(19),Hiyori:prime(20),Misogi:prime(21),Ayane:prime(22),Tamaki:prime(23),Tomo:prime(24),SummerTamaki:prime(25),Eriko:prime(26),SummerPekorinne:prime(27),Kurumi:prime(28),Djeeta:prime(29),Rei:prime(30),Shizuru:prime(31),Mimi:prime(34),Shinobu:prime(35),Mahiru:prime(37),Yukari:prime(38),Monika:prime(39),Ninon:prime(40),Mifuyu:prime(41),Ilya:prime(42),Saren:prime(43),Anna:prime(44),HalloweenShinobu:prime(45),SummerMifuyu:prime(46),Kokkoro:prime(47),SummerKokkoro:prime(50),Rin:prime(53),Mitsuki:prime(54),Akari:prime(55),Yori:prime(56),HalloweenMiyako:prime(57),Arisa:prime(58),Rino:prime(61),Suzuna:prime(62),Shiori:prime(64),Io:prime(65),Suzume:prime(67),Misato:prime(70),Kyaru:prime(73),Hatsune:prime(74),Misaki:prime(75),SummerSuzume:prime(77),SummerKyaru:prime(78),Aoi:prime(79),Chika:prime(80),Maho:prime(81),Yui:prime(82),Yuki:prime(83),Kyouka:prime(84),HalloweenMisaki:prime(85)};module.exports.prime=primeChar;

},{"nth-prime":17}]},{},[20])(20)
});
