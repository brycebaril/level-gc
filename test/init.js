var test = require("tape").test

var level = require("level-test")()
var testdb = level("test-init")

test("load", function (t) {
  t.plan(2)

  var gc = require("../")
  t.ok(gc, "Loaded level-gc")

  var scanner = gc(testdb, null)
  t.ok(scanner.run, "created a gc scanner")
})
