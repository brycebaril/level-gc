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
var filter = require("through2-filter")

var gc = require("level-gc")

// Create a GC filter to delete all records starting with 'temp'
var re = /^temp/
var Filter = filter.ctor({objectMode: true},
  function (record) {
    // Return `true` for records you want removed.
    return re.exec(record.key)
  })

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

If you provide the optional `lts` long term storage instance, as records are deleted they will be put into the `lts` instance.

**For simple filters, [through2-filter](http://npm.im/through2-filter)'s `.ctor()` method is very convenient.

**For more complex filters or transforms, see [through2](http://npm.im/through2)'s `.ctor()` method for easily creating streams2 Transforms.


`.run([callback])`
----------------

Execute the gc scan. Callback is `callback(err, start, end, scanned, culled)`.

Events
------

  * finish: function (start, end, scanned, culled)


LICENSE
=======

MIT
