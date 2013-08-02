module.exports = GC

var EventEmitter = require("events").EventEmitter
var util = require("util")
var through = require("through2")
var Transform = require("stream").Transform || require("readable-stream/transform")

function GC(db, Filter, lts) {
  if (!(this instanceof GC)) return new GC(db, Filter, lts)
  EventEmitter.call(this)
  this.db = db
  this.Filter = Filter
  this.lts = lts
}
util.inherits(GC, EventEmitter)

GC.prototype.run = function (cb) {
  var self = this
  var start = Date.now()
  var end
  var scanned = culled = 0

  var rs = this.db.readStream()

  var ws = this.db.writeStream({type: "del"})
  var reply = function () {
    if (end) return
    end = Date.now()
    self.emit("finished", start, end, scanned, culled)
    if (cb) return cb(null, start, end, scanned, culled)
  }
  ws.once("end", reply)
  ws.once("close", reply)
  ws.once("error", function (err) {
    if (cb) return cb(err)
    throw err
  })

  var filter = new this.Filter({objectMode: true})
  if (!filter instanceof Transform) return cb(new Error("Filter must be a streams2 Transform"))

  var scanCounter = through({objectMode: true}, function (record, encoding, cb) {
    scanned++
    this.push(record)
    cb()
  })

  var culledCounter = through({objectMode: true}, function (record, encoding, cb) {
    culled++
    this.push(record)
    cb()
  })

  var pipeline = rs
    .pipe(scanCounter)
    .pipe(filter)
    .pipe(culledCounter)

  if (this.lts) pipeline.pipe(this.lts.createWriteStream())

  pipeline.pipe(ws)
}
