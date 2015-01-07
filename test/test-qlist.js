assert = require('assert');
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

    'append should be alias for push': function(t) {
        t.equal(this.cut.append, this.cut.push);
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

    'should store 40k items': function(t) {
        var i, ret = new Array();
        for (i=0; i<40000; i++) this.cut.append(i);
        for (i=0; i<40000; i++) t.equal(i, this.cut.shift());
        t.done();
    },

    'peek should return first item': function(t) {
        this.cut.append(1);
        this.cut.append(2);
        t.equal(1, this.cut.peek());
        t.equal(1, this.cut.peek());
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
        assert.equal(this.cut.length(), 0);
        this.cut.push(1);
        assert.equal(this.cut.length(), 1);
        this.cut.unshift(2);
        assert.equal(this.cut.length(), 2);
        this.cut.unshift(3);
        assert.equal(this.cut.length(), 3);
        this.cut.unshift(4);
        this.cut.push(5);
        assert.equal(this.cut.length(), 5);
        for (i=4; i>=0; i--) {
            this.cut.shift();
            assert.equal(this.cut.length(), i);
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
        t.done();
    }
};
