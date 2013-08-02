var test = require("tape").test

var Sublevel = require("level-sublevel")
var concat = require("concat-stream")
var Transform = require("stream").Transform || require("readable-stream/transform")
var util = require("util")

var level = require("level-test")()
var db = level("test-sublevel")
var testdb = Sublevel(db).sublevel("test")

var gc = require("../")

test("load", function (t) {
  t.plan(1)

  db.put("tempFOO", "bar")

  testdb.batch([
    {type: "put", key: "cat", value: "meow"},
    {type: "put", key: "dog", value: "woof"},
    {type: "put", key: "bird", value: "tweet"},
    {type: "put", key: "fish", value: "..."},
    {type: "put", key: "mouse", value: "squeak"},
    {type: "put", key: "snake", value: "hiss"},
    {type: "put", key: "horse", value: "neigh"},
    {type: "put", key: "turtle", value: "snap"},
    {type: "put", key: "tempcat", value: "purr"},
    {type: "put", key: "tempdog", value: "bark"},
  ], function (err) {
    t.notOk(err, "no error")
  })
})

test("scan", function (t) {
  t.plan(1)

  function count(records) {
    t.equals(records.length, 10, "All 10 records are there")
  }

  testdb.readStream().pipe(concat(count))
})

test("run", function (t) {
  t.plan(7)

  var Transform = require("stream").Transform
  function Filter(options) {
    Transform.call(this, options)
    this.re = new RegExp("^temp")
  }
  util.inherits(Filter, Transform)
  Filter.prototype._transform = function (record, encoding, callback) {
    // "pushing" a record will cause it to be deleted.
    if (this.re.exec(record.key)) this.push(record)
    // "skipping" a record will retain it
    return callback()
  }

  var scanner = gc(testdb, Filter)
  t.ok(scanner.run, "created a gc scanner")

  scanner.run(function (err, start, end, scanned, culled) {
    t.notOk(err, "no error")
    t.ok(start, "start")
    t.ok(end, "end")
    t.equals(scanned, 10, "scanned 10 records")
    t.equals(culled, 2, "culled 2 records")
    t.ok(end > start, "took more than a millisecond")
  })
})

test("scan again", function (t) {
  t.plan(1)

  function count(records) {
    t.equals(records.length, 8, "Now only 8 records are there")
  }

  testdb.readStream().pipe(concat(count))
})

test("parent", function (t) {
  t.plan(2)

  db.get("tempFOO", function (err, value) {
    t.notOk(err, "Yay no error")
    t.ok(value, "bar", "This 'temp' key wasn't deleted.")
  })
})
