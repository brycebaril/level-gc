module.exports = GC

var EventEmitter = require("events").EventEmitter
var util = require("util")
var t2filter = require("through2-filter")
var spy = require("through2-spy")
var Transform = require("stream").Transform || require("readable-stream/transform")

function GC(db, fn, lts) {
  if (!(this instanceof GC)) return new GC(db, fn, lts)
  EventEmitter.call(this)
  this.db = db
  this.Filter = t2filter.ctor({objectMode: true}, fn)
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
    self.emit("finish", start, end, scanned, culled)
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

  var spyOpts = {objectMode: true}

  var pipeline = rs
    .pipe(spy(spyOpts, function () {scanned++}))
    .pipe(filter)
    .pipe(spy(spyOpts, function () {culled++}))

  if (this.lts) pipeline.pipe(this.lts.createWriteStream())

  pipeline.pipe(ws)
}
