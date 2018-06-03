/**
 * Copyright (C) 2014-2018 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

List = require('../index');

module.exports = {
    setUp: function(done) {
        this.cut = new List();
        done();
    },

    'package should parse.json': function(t) {
        t.expect(1);
        var json = require('../package.json');
        t.ok(1);
        t.done();
    },

    'should have expected methods': function(t) {
        t.equal(typeof this.cut.push, 'function');
        t.equal(typeof this.cut.unshift, 'function');
        t.equal(typeof this.cut.peek, 'function');
        t.equal(typeof this.cut.isEmpty, 'function');
        t.equal(typeof this.cut.size, 'function');
        t.equal(typeof this.cut.toArray, 'function');
        t.equal(typeof this.cut.fromArray, 'function');
        t.equal(typeof this.cut.peekAt, 'function');
        t.equal(typeof this.cut.pokeAt, 'function');
        t.done();
    },

    'should support common aliases': function(t) {
        t.equal(this.cut.append, this.cut.push);
        t.equal(this.cut.enqueue, this.cut.push);
        t.equal(this.cut.dequeue, this.cut.shift);
        t.equal(this.cut.getLength, this.cut.size);
        t.equal(this.cut.get, this.cut.peekAt);
        t.equal(this.cut.set, this.cut.pokeAt);
        t.equal(this.cut.setAt, this.cut.pokeAt);
        t.done();
    },

    'should return items in order': function(t) {
        this.cut.append(1);
        this.cut.append(3);
        this.cut.append(2);
        t.equal(1, this.cut.shift());
        t.equal(3, this.cut.shift());
        t.equal(2, this.cut.shift());
        t.ok(!this.cut.shift());
        t.done();
    },

    'should return undefined on empty list': function(t) {
        this.cut.shift();
        t.equal(this.cut._head, 0);
        t.equal(this.cut._tail, 0);
        t.done();
    },

    'should store 40k items': function(t) {
        var i, ret = new Array();
        for (i=0; i<40000; i++) this.cut.append(i);
        t.equal(this.cut.peek(), 0);
        t.equal(this.cut.pop(), 39999);
        for (i=0; i<40000-1; i++) t.equal(i, this.cut.shift());
        t.done();
    },

    'peek() should return first item': function(t) {
        t.equal(this.cut.peek(), undefined);
        this.cut.append(1);
        this.cut.append(2);
        t.equal(1, this.cut.peek());
        t.equal(1, this.cut.peek());
        t.done();
    },

    'peekAt(n) should return n-th item or undefined': function(t) {
        this.cut.append(1);
        this.cut.append(2);
        // [ 1 2 - - ]
        t.equal(this.cut.peekAt(1), 2);
        t.equal(this.cut.peekAt(2), undefined);
        t.equal(this.cut.peekAt(-2), 1);
        this.cut.append(3);
        // [ 1 2 3 - ]
        this.cut.shift();
        this.cut.shift();
        // [ - - 3 - ]
        this.cut.append(4);
        this.cut.append(5);
        // [ 5 - 3 4 ]
        t.equal(this.cut.peekAt(-1), 5);
        t.equal(this.cut.peekAt(-2), 4);
        t.equal(this.cut.peekAt(-3), 3);
        t.equal(this.cut.peekAt(-4), undefined);
        t.equal(this.cut.peekAt(0), 3);
        t.equal(this.cut.peekAt(1), 4);
        t.equal(this.cut.peekAt(2), 5);
        t.equal(this.cut.peekAt(3), undefined);
        t.done();
    },

    'peekAt(n) should return n-th item in fromArray list': function(t) {
        var dataset = [1, 2, 3, 4, 5, 6];
        var l = new List().fromArray(dataset);
        var vals = [];
        for (var i=0; i<l.size(); i++) vals[i] = l.peekAt(i);
        t.deepEqual(vals, dataset);
        t.done();
    },

    'setAt(n,v) should set the n-th item': function(t) {
        this.cut.append(1);
        this.cut.append(2);
        // [ 1 2 - - ]
        var v = this.cut.setAt(1, 22);
        // [ 1 22 - - ]
        t.strictEqual(v, 22);
        t.equal(this.cut.size(), 2);
        t.equal(this.cut.peekAt(0), 1);
        t.equal(this.cut.peekAt(1), 22);
        t.equal(this.cut.peekAt(2), undefined)
        var v = this.cut.setAt(3, 3);
        // [ 1 22 - - ]
        t.strictEqual(v, undefined);
        t.equal(this.cut.size(), 2);
        t.equal(this.cut.peekAt(3), undefined);
        var v = this.cut.setAt(-2, 11);
        // [ 11 22 - - ]
        t.strictEqual(v, 11);
        t.equal(this.cut.size(), 2);
        t.equal(this.cut.peekAt(0), 11);
        t.equal(this.cut.peekAt(1), 22);
        var v = this.cut.setAt(-3, 3);
        // [ 11 22 - - ]
        t.strictEqual(v, undefined);
        t.equal(this.cut.peekAt(0), 11);
        t.equal(this.cut.peekAt(1), 22);
        t.equal(this.cut.size(), 2);
        t.done();
    },

    'isEmpty should return true on empty list': function(t) {
        t.ok(this.cut.isEmpty());
        this.cut.append(1);
        t.ok(!this.cut.isEmpty());
        t.done();
    },

    'length should return the number of items on the list': function(t) {
        var i;
        t.equal(this.cut.length(), 0);
        this.cut.push(1);
        t.equal(this.cut.length(), 1);
        this.cut.unshift(2);
        t.equal(this.cut.length(), 2);
        this.cut.unshift(3);
        t.equal(this.cut.length(), 3);
        this.cut.unshift(4);
        this.cut.push(5);
        t.equal(this.cut.length(), 5);
        for (i=4; i>=0; i--) {
            this.cut.shift();
            t.equal(this.cut.length(), i);
        }
            
        t.done();
    },

    'unshift should add items at head of list': function(t) {
        var i, uniq = (Math.random() * 0x1000000 | 0).toString(16);
        this.cut.push(uniq);
        for (i=0; i<40000; i++) this.cut.unshift(i);
        for (i=40000-1; i>=0; i--) t.equals(i, this.cut.shift());
        t.equals(uniq, this.cut.shift());
        t.done();
    },

    'pop should remove items from tail of list': function(t) {
        var i, uniq = (Math.random() * 0x1000000 | 0).toString(16);
        this.cut.push(uniq);
        for (i=0; i<40000; i++) this.cut.push(i);
        for (i=40000-1; i>=0; i--) t.equals(i, this.cut.pop());
        t.equals(uniq, this.cut.shift());
        t.equal(this.cut.pop(), undefined);
        t.done();
    },

    'shift should overwrite the removed item slot': function(t) {
        this.cut.push({});
        t.deepEqual(this.cut._list[this.cut._head], {});
        this.cut.shift();
        t.equal(this.cut._list[this.cut._head - 1], -1);
        t.done();
    },

    'pop should overwrite the removed item slot': function(t) {
        this.cut.push({});
        t.deepEqual(this.cut._list[this.cut._tail - 1], {});
        this.cut.pop();
        t.equal(this.cut._list[this.cut._tail], -1);
        t.done();
    },

    'toArray should return list contents': function(t) {
        t.deepEqual(this.cut.toArray(), []);
        this.cut.push(1);
        this.cut.push(2);
        t.deepEqual(this.cut.toArray(), [1, 2]);
        this.cut.shift();
        t.deepEqual(this.cut.toArray(), [2]);
        this.cut.push(3);
        this.cut.push(4);
        this.cut.push(5);
        t.deepEqual(this.cut.toArray(), [2, 3, 4, 5]);
        this.cut.push(6);
        t.deepEqual(this.cut.toArray(), [2, 3, 4, 5, 6]);
        this.cut.shift();
        t.deepEqual(this.cut.toArray(), [3, 4, 5, 6]);
        this.cut.pop();
        t.deepEqual(this.cut.toArray(), [3, 4, 5]);
        t.done();
    },

    'fromArray should populate list contents': function(t) {
        this.cut.fromArray([1, 2, 3]);
        t.equal(this.cut.peek(), 1);
        t.equal(this.cut.pop(), 3);
        t.equal(this.cut.size(), 2);
        t.done();
    },

    'pop should shrink array when 3/4 empty': function(t) {
        for (var i=0; i<40010; i++) this.cut.push(i);
        var cap1 = this.cut._capacityMask;
        for (var i=0; i<30005; i++) this.cut.pop();
        var cap2 = this.cut._capacityMask;
        t.ok(cap1 > cap2);
        t.done();
    },

    'shift should shink array when 3/4 empty': function(t) {
        for (var i=0; i<65535; i++) this.cut.push(i);
        for (var i=0; i<65535; i++) this.cut.shift();
        this.cut.push(1);
        this.cut.shift();
        // now _list is 64k in length, _head == _tail == 0
        // TODO: will not shink array even if _list is millions long
        // until have more than 10k elements
        for (var i=0; i<10001; i++) this.cut.push(i);
        var cap1 = this.cut._capacityMask;        
        this.cut.shift();
        var cap2 = this.cut._capacityMask;
        t.ok(cap1 > cap2);
        t.done();
    },

    'fromList should grow array as needed': function(t) {
        var cap1 = this.cut._capacityMask;
        var data = [];
        for (var i=0; i<257; i++) data.push(i);
        this.cut.fromArray(data);
        var cap2 = this.cut._capacityMask;
        t.ok(cap2 > cap1);
        t.done();
    },
};
