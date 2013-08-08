level-gc
========

Garbage Collection for leveldb ([levelup](http://npm.im/levelup)).

[![NPM](https://nodei.co/npm/level-gc.png)](https://nodei.co/npm/level-gc/)

Scan through your level instance and cull records based on custom logic.

```javascript
var util = require("util")

var level = require("level")
var db = level("/tmp/mydb")
var lts = level("/tmp/long-term-storage")

var gc = require("level-gc")

// Create a GC filter to delete all records starting with 'temp'
var re = /^temp/
var scanner = gc(db, function (record) {
  // Return `true` for records you want removed.
  return re.exec(record.key)
}, lts)

scanner.run(function (err, start, end, scanned, culled) {
  /* ... */
})

scanner.on("finish", function (start, end, scanned, culled) { /* ... */ })

```

API
===

`gc(db, filterFn [, lts])`
------------------------

  * db: A levelup-compatible instance. (e.g. `levelup` or any compliant wrapper such as `level-sublevel` or `level-version`)
  * filterFn: A function that accepts a levelup record and returns `true` for anything to be removed by the gc process. `filterFn({key: key, value: value, ...})`
  * (optional) lts: A long-term storage instance of the same type as the original db.

Returns an object that will let you trigger Garbage Collection runs.

If you provide the optional `lts` long term storage instance, as records are deleted they will be put into the `lts` instance.

Each run your function will be turned into a `stream.Transform` instance via [through2-filter](http://npm.im/through2-filter) so you can stuff onto `this` and it will be available for each record in a single gc run for more complex filters.


`.run([callback])`
----------------

Execute the gc scan. Callback is `callback(err, start, end, scanned, culled)`.

Events
------

  * finish: function (start, end, scanned, culled)


LICENSE
=======

MIT
