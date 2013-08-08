var test = require("tape").test

var concat = require("concat-stream")
var util = require("util")

var level = require("level-test")()
var testdb = level("test-reuse")
var gc = require("../")

var re = /^temp/
var scanner = gc(testdb, function (record) {
  return re.exec(record.key)
})

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
  t.plan(6)

  scanner.run(function (err, start, end, scanned, culled) {
    t.notOk(err, "no error")
    t.ok(start, "start")
    t.ok(end, "end")
    t.equals(scanned, 10, "scanned 10 records")
    t.equals(culled, 2, "culled 2 records")
    t.ok(end > start, "took more than a millisecond")
  })
})

test("moar data in", function (t) {
  t.plan(1)

  testdb.batch([
    {type: "put", key: "parrot", value: "squawk"},
    {type: "put", key: "temppuppy", value: "woof woof"},
  ], function (err) {
    t.notOk(err, "no error")
  })
})

test("run", function (t) {
  t.plan(6)

  scanner.run(function (err, start, end, scanned, culled) {
    t.notOk(err, "no error")
    t.ok(start, "start")
    t.ok(end, "end")
    t.equals(scanned, 10, "scanned 10 records")
    t.equals(culled, 1, "culled 1")
    t.ok(end > start, "took more than a millisecond")
  })
})

test("scan again", function (t) {
  t.plan(1)

  function count(records) {
    t.equals(records.length, 9, "Now only 9 records are there")
  }

  testdb.readStream().pipe(concat(count))
})
