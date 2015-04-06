qlist
=====

QList is a very very fast classic queue:  items are appended with `push()`
and the oldest waiting item is retrieved with `shift()`.  Items may be
prepended with `unshift`; the last item can be retrieved with `pop`.

A `remove()` method was considered but it slowed the fast path too much for
the little benefit it provided.  See Discussion, below.

        var List = require('qlist');
        var q = new List();
        q.append(1);
        q.append(2);
        q.shift();      // => 1


Benchmark
---------

The included benchmark script measures the speed of pushes, shifts, and
push/shift pairs (the expected use cases for this data structure).

        node benchmark/benchmark.js qlist  // 16 / 34 / 201 m/s
        node benchmark/benchmark.js double-ended-queue  // 6.4 / 27 / 180 m/s


Installation
------------

        npm install qlist
        npm test qlist


Discussion
----------

QList was developed as part of an investigation into how `setImmediate()`
could be made to run faster.  The key observation was that a circular buffer
is faster than an array or a linked list for storing transient data.  QList is
implemented as circular buffer inside an array that is extended as needed.

Initially designed as a drop-in replacement for the nodejs immediate queue
(see the [qtimers](https://npmjs.org/package/qtimers) package), it
had the same append / peek / remove / shift / isEmpty methods.  During the 
work with setImmediate, the remove method was found to be redundant, and
instead removal was folded into the setImmediate callback validity test.
(See the [qtimers](https://npmjs.org/package/qtimers) package.)

QList is implemented as a double-ended queue.


Methods
-------

### new List( )

Create a new list.

### push( item )

Add an item to the end of the list.  `append()` is recognized as synonym for push.

### pop( )

Remove and return the last item on the list, else `undefined` if empty list.

### shift( )

Remove and return the first item on the list, else `undefined` if empty list.

### unshift( item )

Add an item at the beginning of the list.  This item would be returned by
`shift` before any of the other items already on the list.

### peek( )

Return the first item on the list without removing it.

### isEmpty( )

test whether the list is empty, return true / false.

### length( )

Return the number of items on the list, or 0 zero if empty.


Todo
----

- add peek(idx) method (peek at arbitrary item)
- add peekTail() method (peek at last item)
- add peekHead() as an alias for peek(0)
- implement a maxLength capacity limit for a true circular buffer


Related Work
------------

- [double-ended-queue](https://npmjs.org/package/double-ended-queue)
- [qheap](https://npmjs.org/package/qheap)
- [qtimers](https://npmjs.org/package/qtimers)
