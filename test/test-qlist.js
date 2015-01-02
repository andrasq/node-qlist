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
};
