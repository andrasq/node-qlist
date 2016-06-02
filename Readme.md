qlist
=====

QList is a very very fast classic queue:  items are appended with `push()`
and the oldest waiting item is retrieved with `shift()`.  Items may be
prepended with `unshift`; the last item can be retrieved with `pop`.
QList is implemented as resizable circular buffer mapped into an Array.

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
(Timed with node-v5.10.1 on a 3.5GHz AMD Phenom II B55)

        node benchmark/benchmark.js qlist  // 49 / 138 / 81 m/s
        node benchmark/benchmark.js double-ended-queue  // 12 / 150 / 48 m/s

Tested with the benchmark included in the double-ended-queue repo,

### 1000 items in the queue

    qlist x 24,574,632 ops/sec ±0.33% (102 runs sampled)
    double-ended-queue x 13,737,005 ops/sec ±0.12% (102 runs sampled)
    node-deque x 6,033,985 ops/sec ±15.86% (94 runs sampled)
    built-in array x 1,477,859 ops/sec ±0.14% (98 runs sampled)

### 2 million items in the queue

    qlist x 24,170,807 ops/sec ±0.12% (103 runs sampled)
    double-ended-queue x 14,197,766 ops/sec ±0.17% (100 runs sampled)
    node-deque x 1,851,165 ops/sec ±6.65% (79 runs sampled)
    built-in array x 80.35 ops/sec ±0.49% (71 runs sampled)


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

Returns the first item on the list without removing it.

### peekAt( n )

Returns the n-th item on the list.  Zero is the first element, 1 is the second,
etc.  Elements at negative offsets are that many from the end:  -1 is one before
the end (the last element), -2 is two before the end (one before last), etc.

This method implements peek() (peekAt(0)), peekTail() (peekAt(-1)) and peekIdx(ix)
(peekAt(ix)).  A dedicated method is faster than testing for an optional argument
inside peek().

### isEmpty( )

test whether the list is empty, return true / false.

### size( )

Return the number of items on the list, or 0 zero if empty.
For historical reasons, also available as `length()`.

### toArray( )

Copy out the contents of the list into an array and return the array.

### fromArray( array )

Set the list contents from the given array.  Any existing contents are discarded.


Todo
----

- implement a maxLength capacity limit for a true circular buffer


Related Work
------------

- [double-ended-queue](https://npmjs.org/package/double-ended-queue) - another fast circular buffer
- [qheap](https://npmjs.org/package/qheap) - partially sorted set

