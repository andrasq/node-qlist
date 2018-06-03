/**
 * list data structure mapped into a circular array
 *
 * Copyright (C) 2014-2018 Andras Radics
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


module.exports = QList;


function QList( ) {
    this._list = new Array(4);  // circular buffer
    this._head = 0;             // next unread item
    this._tail = 0;             // next empty slot
    this._capacityMask = 0x3;   // capacity bitmask
}

QList.prototype.peek = QList_peek;
function QList_peek( ) {
    if (this._head === this._tail) return undefined;
    return this._list[this._head];
}

/**
QList.prototype.poke = QList_poke;
function QList_poke( v ) {
    if (this._head !== this._tail) return this._list[this._head] = v;
    else return undefined;
}
**/

QList.prototype.peekAt = function QList_peekAt( n ) {
    var length = this.size();
    if (n >= length || n < -length) return undefined;
    if (n < 0) n += length;
    n = (this._head + n) & this._capacityMask;
    return this._list[n];
}
QList.prototype.get = QList.prototype.peekAt;

QList.prototype.pokeAt = function pokeAt( n, v ) {
    var length = this.size();
    if (n >= length || n < -length) return undefined;
    if (n < 0) n += length;
    n = (this._head + n) & this._capacityMask;
    return this._list[n] = v;
}
QList.prototype.setAt = QList.prototype.pokeAt;
QList.prototype.set = QList.prototype.pokeAt;

QList.prototype.length = QList_size;
QList.prototype.size = QList_size;
QList.prototype.getLength = QList_size;
function QList_size( ) {
    if (this._head === this._tail) return 0;
    if (this._head < this._tail) return this._tail - this._head;
    else return this._capacityMask + 1 - (this._head - this._tail);
}

QList.prototype.unshift = QList_unshift;
function QList_unshift( item ) {
    // invariant: tail points to an empty slot, ie head-1 is also empty
    // and _list.length is a power of 2
    var len = this._list.length;
    this._head = (this._head - 1 + len) & this._capacityMask;
    this._list[this._head] = item;
    if (this._tail === this._head) this._growArray();
}

QList.prototype.shift = QList_shift;
QList.prototype.dequeue = QList_shift;
function QList_shift( ) {
    var head = this._head;
    if (head === this._tail) return undefined;
    var item = this._list[head];
    this._list[head] = -1;
    this._head = (head + 1) & this._capacityMask;

    // nb: !head is slower than head < 2 ?? (160 vs 120m/s) (10% overhead for the test)
    if (head < 2 && this._tail > 10000 && this._tail <= this._list.length >>> 2) this._shrinkArray();

    return item;
}

QList.prototype.push = QList_append;
QList.prototype.append = QList_append;
QList.prototype.enqueue = QList_append;
QList.prototype.add = QList_append;
function QList_append( item ) {
    var tail = this._tail;
    this._list[tail] = item;
    this._tail = (tail + 1) & this._capacityMask;
    if (this._tail === this._head) this._growArray();
}

QList.prototype.pop = QList_pop;
function QList_pop( ) {
    var tail = this._tail;
    if (tail === this._head) return undefined;
    this._tail = (tail - 1 + this._list.length) & this._capacityMask;
    var item = this._list[this._tail];
    this._list[this._tail] = -1;

    if (this._head < 2 && tail > 10000 && tail <= this._list.length >>> 2) this._shrinkArray();

    return item;
}

QList.prototype.isEmpty = QList_isEmpty;
function QList_isEmpty( ) {
    return this._head === this._tail;
}

QList.prototype.toArray = QList_toArray;
function QList_toArray( ) {
    return this._copyArray(false);
}

QList.prototype.fromArray = QList_fromArray;
function QList_fromArray( array ) {
    var list = this._list = new Array(64);
    this._capacityMask = 64-1;
    this._head = this._tail = 0;
    while (list.length < array.length) this._growArray();
    for (var i=0; i<array.length; i++) list[i] = array[i];
    this._tail = array.length;
    return this;
}

QList.prototype._copyArray = QList__copyArray;
function QList__copyArray( isFull ) {
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

QList.prototype._growArray = QList__growArray;
function QList__growArray( ) {
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

QList.prototype._shrinkArray = QList__shrinkArray;
function QList__shrinkArray( ) {
    this._list.length >>>= 1;
    this._capacityMask >>>= 1;
}

/**
QList.prototype.gc = QList_gc;
function QList_gc( ) {
    if (this._list.length < 100) return;
    var size = this.size();
    if (size < this._list.length >>> 1) {
        this._list = this._copyArray(false);
        this._head = 0;
        this._tail = size;
        while (size < this._capacityMask >>> 1) this._capacityMask >>>= 1;
        this._list.length = this._capacityMask + 1;
    }
}
**/

// speed up access
QList.prototype = QList.prototype;
