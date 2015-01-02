qlist
=====

QList is a very ver fast classic queue:  items are appended with `push()`
and the oldest waiting item is retrieved with `shift()`.

Currently only the append() and shift() methods are implemented, but
`unshift()` and `pop()` will be added.  A `remove()` method was considered but
it slowed the fast path too much for the little benefit it provided.  See
Discussion, below.

        var List = require('qlist');
        var q = new List();
        q.append(1);
        q.append(2);
        q.shift();      // => 1


Benchmark
---------

The included benchmark script measures the speed of pushes, shifts, and
push/shift pairs (the expected use cases for this data structure).

        node benchmark/benchmark.js qlist  // 76.2 m/s
        node benchmark/benchmark.js double-ended-queue  // 65.8 m/s


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

Initially designed as a drop-in replacement for the nodejs immediate queue, it
had the same append / peek / remove / shift / isEmpty methods.  During the 
work with setImmediate, the remove method was found to be redundant, and
instead removal was folded into the setImmediate callback validity test.

QList is implemented as a double-ended queue (though currently just two of the
four traditional methods are written).


Methods
-------

### new List( )

Create a new list.

### push( item )

Add an item to the end of the list.  `append()` is recognized as meaning push.

### shift( )

Remove and return the first item on the list.

### peek( )

Return the first item on the list without removing it.

### isEmpty( )

test whether the list is empty, return true / false.


TODO
----

- add unshift() method (prepend to list)
- add pop() method (remove and return last item)
- add top() method (peek at last item)
- add get(idx) method (peek at arbitrary item)
- add length() method (return count of items on list)


Related Work
------------

- [dequeue](https://npmjs.org/package/double-ended-queue)
- [qheap](https://npmjs.org/package/qheap)
- [qtimers](https://npmjs.org/package/qtimers)
