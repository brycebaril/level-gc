var test = require("tape").test

var concat = require("concat-stream")
var util = require("util")

var level = require("level-test")()
var testdb = level("test-nowork")
var gc = require("../")

test("load", function (t) {
  t.plan(1)

  testdb.batch([
    {type: "put", key: "cat", value: "meow"},
    {type: "put", key: "dog", value: "woof"},
    {type: "put", key: "bird", value: "tweet"},
    {type: "put", key: "fish", value: "..."},
    {type: "put", key: "mouse", value: "squeak"},
    {type: "put", key: "snake", value: "hiss"},
    {type: "put", key: "horse", value: "neigh"},
    {type: "put", key: "turtle", value: "snap"},
  ], function (err) {
    t.notOk(err, "no error")
  })
})

test("scan", function (t) {
  t.plan(1)

  function count(records) {
    t.equals(records.length, 8, "All 8 records are there")
  }

  testdb.readStream().pipe(concat(count))
})

test("run", function (t) {
  t.plan(7)

  var re = /^temp/
  var scanner = gc(testdb, function (record) {
    return re.exec(record.key)
  })
  t.ok(scanner.run, "created a gc scanner")

  scanner.run(function (err, start, end, scanned, culled) {
    t.notOk(err, "no error")
    t.ok(start, "start")
    t.ok(end, "end")
    t.equals(scanned, 8, "scanned 8 records")
    t.equals(culled, 0, "culled 0 records")
    t.ok(end > start, "took more than a millisecond")
  })
})

test("scan again", function (t) {
  t.plan(1)

  function count(records) {
    t.equals(records.length, 8, "All 8 records are there")
  }

  testdb.readStream().pipe(concat(count))
})
