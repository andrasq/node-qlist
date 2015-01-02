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
 * Removes are not supported.  The caller can mark items as _removed = 1;
 * fetching items is very fast (180m/s), so skipping the occasional item
 * should not be a problem.  Remove-intensive uses might benefit from
 * a doubly linked list implementation.
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

// TODO: UNTESTED:
List2b.prototype.unshift = List2b_unshift;
function List2b_unshift( item ) {
    // invariant: tail points to an empty slot, ie head-1 is also empty
    var len = this._list.length;
    this._head = (this._head - 1 + len) % len;
    this._list[this._head] = item;
    if (this._tail === this._head) this._growArray(2);
}

List2b.prototype.shift = List2b_shift;
function List2b_shift( ) {
    var head = this._head;
    var item = this._list[head];
    if (head === this._tail) return undefined;
    this._head = (head + 1) & this._capacityMask;

    // nb: !head is slower than head < 2 ?? (160 vs 120m/s)
    if (head < 2 && this._tail > 10000 && this._tail <= this._list.length >> 2) this._list.length >>= 1;

    return item;
}

List2b.prototype.push = List2b_append;
List2b.prototype.append = List2b_append;
function List2b_append( item ) {
    var tail = this._tail;
    this._list[tail] = item;
    this._tail = (tail + 1) & this._capacityMask;

    if (this._tail === this._head) this._growArray(2);
}

// TODO:
// List2b.prototype.pop

List2b.prototype.isEmpty = List2b_isEmpty;
function List2b_isEmpty( ) {
    return this._head === this._tail;
}

List2b.prototype._growArray = List2b__growArray;
function List2b__growArray( double ) {
    // reestablish invariant: tail points to an empty slot
    // when the array is full, head == tail and
    // data order is [head..array.length-1], [0..head-1].

    var head = this._head;

    if (!head) {
        // if head is at 0 and array is full, safe to extend
        this._tail = this._list.length;
        this._list.length *= double;
        this._capacityMask = (this._capacityMask << 1) | 1;
        return;
    }
    else {
        // copy existing data, first head to end, then beginning to tail.
        // it is faster to copy into a new array than to repack the existing
        var newList = new Array();
        var list = this._list;
        var len = list.length;
        var i;
        for (i=head; i<len; i++) newList.push(list[i]);
        for (i=0; i<head; i++) newList.push(list[i]);
        newList.length *= double;

        this._list = newList;
        this._capacityMask = (this._capacityMask << 1) | 1;
        this._head = 0;
        this._tail = len;
        return;
    }
}
