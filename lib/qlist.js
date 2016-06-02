/**
 * list data structure mapped into a circular array
 *
 * Copyright (C) 2014-2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * Data items range from head to tail (both are modulo array capacity).
 * Note that when the array is completely full, head == tail and the data, in
 * order, is always [head -> array.length-1], then [0 -> head-1].
 *
 * Removes from the middle of the list are not supported.  The caller
 * can mark removed items, and since fetching items is very fast (400m/s),
 * skipping the occasional item should not be a problem.  Remove-intensive
 * uses might benefit from a doubly linked list implementation.
 */


module.exports = List2b;


function List2b( ) {
    this._list = new Array(4);  // circular buffer
    this._head = 0;             // next unread item
    this._tail = 0;             // next empty slot
    this._capacityMask = 0x3;   // capacity bitmask
}

List2b.prototype.peek = List2b_peek;
function List2b_peek( ) {
    if (this._head === this._tail) return undefined;
    return this._list[this._head];
}

List2b.prototype.length = List2b_size;
List2b.prototype.size = List2b_size;
function List2b_size( ) {
    if (this._head === this._tail) return 0;
    if (this._head < this._tail) return this._tail - this._head;
    else return this._capacityMask + 1 - (this._head - this._tail);
}

List2b.prototype.unshift = List2b_unshift;
function List2b_unshift( item ) {
    // invariant: tail points to an empty slot, ie head-1 is also empty
    // and _list.length is a power of 2
    var len = this._list.length;
    this._head = (this._head - 1 + len) & this._capacityMask;
    this._list[this._head] = item;
    if (this._tail === this._head) this._growArray();
}

List2b.prototype.shift = List2b_shift;
function List2b_shift( ) {
    var head = this._head;
    if (head === this._tail) return undefined;
    var item = this._list[head];
    this._head = (head + 1) & this._capacityMask;

    // nb: !head is slower than head < 2 ?? (160 vs 120m/s) (10% overhead for the test)
    if (head < 2 && this._tail > 10000 && this._tail <= this._list.length >>> 2) this._shrinkArray();

    return item;
}

List2b.prototype.push = List2b_append;
List2b.prototype.append = List2b_append;
function List2b_append( item ) {
    var tail = this._tail;
    this._list[tail] = item;
    this._tail = (tail + 1) & this._capacityMask;
    if (this._tail === this._head) this._growArray();
}

List2b.prototype.pop = List2b_pop;
function List2b_pop( ) {
    var tail = this._tail;
    if (tail === this._head) return undefined;
    var len = this._list.length;
    this._tail = (tail - 1 + len) & this._capacityMask;   
    var ret = this._list[this._tail];

    if (this._head < 2 && tail > 10000 && tail <= len >>> 2) this._shrinkArray();

    return ret;
}

List2b.prototype.isEmpty = List2b_isEmpty;
function List2b_isEmpty( ) {
    return this._head === this._tail;
}

List2b.prototype.toArray = List2b_toArray;
function List2b_toArray( ) {
    return this._copyArray(false);
}

List2b.prototype.fromArray = List2b_fromArray;
function List2b_fromArray( array ) {
    var list = this._list = new Array(64);
    this._head = this._tail = 0;
    while (list.length < array.length) this._growArray();
    for (var i=0; i<array.length; i++) list[i] = array[i];
    this._tail = array.length;
    return this;
}

List2b.prototype._copyArray = List2b__copyArray;
function List2b__copyArray( isFull ) {
    // copy existing data, first head to end, then beginning to tail.
    // it is faster to copy into a new array than to repack the existing
    var newList = new Array();
    var list = this._list;
    var len = list.length;
    var i;
    if (isFull || this._head > this._tail) {
        for (i=this._head; i<len; i++) newList.push(list[i]);
        for (i=0; i<this._tail; i++) newList.push(list[i]);
    }
    else {
        for (i=this._head; i<this._tail; i++) newList.push(list[i]);
    }
    return newList;
}

List2b.prototype._growArray = List2b__growArray;
function List2b__growArray( ) {
    // reestablish invariant: tail points to an empty slot
    // Note: when array is full, head == tail and data is [head..array.length-1], [0..head-1].

    // leave this comment, node-v5 is much faster with it here
    if (this._head) {
        // copy existing data, first head to end, then beginning to tail.
        // it is faster to copy into a new array than to repack the existing
        this._list = this._copyArray(true);
        this._head = 0;
    }
    // once head is at 0 and array is full, safe to extend
    this._tail = this._list.length;
    this._list.length *= 2;
    this._capacityMask = (this._capacityMask << 1) | 1;
}

List2b.prototype._shrinkArray = List2b__shrinkArray;
function List2b__shrinkArray( ) {
    this._list.length >>>= 1;
    this._capacityMask >>>= 1;
}


// speed up access
List2b.prototype = List2b.prototype;
