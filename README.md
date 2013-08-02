level-gc
========

Garbage Collection for leveldb ([levelup](http://npm.im/levelup)).

[![NPM](https://nodei.co/npm/level-gc.png)](https://nodei.co/npm/level-gc/)

Periodically scan through your level instance and cull records based on custom logic.

```javascript
var util = require("util")

var level = require("level")
var db = level("/tmp/mydb")
var lts = level("/tmp/long-term-storage")
var gc = require("level-gc")

// Create a GC filter to delete all records starting with 'temp'
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
  return cb()
}

var scanner = gc(db, Filter, lts)

scanner.run(function (err, start, end, scanned, culled) {
  /* ... */
})

scanner.on("finish", function (start, end, scanned, culled) { /* ... */ })

```

API
===

`gc(db, Filter [, lts])`
------------------------

  * db: A levelup-compatible instance. (e.g. `levelup` or any compliant wrapper such as `level-sublevel` or `level-version`)
  * Filter: A streams2 Transform class**
  * (optional) lts: A long-term storage instance of the same type as the original db.

Returns an object that will let you trigger Garbage Collection runs.

**Why not use [through2](http://npm.im/through2)? Well, the filter needs to be reusable, and this is the best interface I've come up with so far for creating a _multi-record scoped reusable_ custom filter.

`.run([callback])`
----------------

Execute the gc scan. Callback is `callback(err, start, end, scanned, culled)`.

Events
------

  * finish: function (start, end, scanned, culled)


LICENSE
=======

MIT
