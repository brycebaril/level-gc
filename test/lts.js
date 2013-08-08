var test = require("tape").test

var concat = require("concat-stream")
var util = require("util")

var level = require("level-test")()
var testdb = level("test-lts")
var lts = level("test-backup")
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

  var re = /^temp/
  var scanner = gc(testdb, function (record) {
    return re.exec(record.key)
  }, lts)
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

test("scan lts", function (t) {
  t.plan(3)

  function count(records) {
    t.equals(records.length, 2, "We backed up 2 records")
    records.map(function (r) {
      t.ok(/^temp/.exec(r.key), "record is a 'temp' record")
    })
  }

  lts.readStream().pipe(concat(count))
})
