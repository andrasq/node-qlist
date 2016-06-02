/**
 * benchmark test rig for list-like data structures
 * that have push() and shift() methods.
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

assert = require('assert');

function fptime() { t = process.hrtime(); return t[0] + t[1] * 1e-9; }

function timeList( List ) {
    nloops = 10000000;
    //dataset = new Array(nloops);
    //for (var i=0; i<dataset.length; i++) dataset[i] = Math.random() * 10000 | 0;

    var x;
    for (i=0; i<10000; i++) x = fptime();

    q = new List();
    t1 = fptime();
    //for (i=0; i<nloops; i++) q.push(Math.random() * 10000 | 0);
    for (i=0; i<nloops; i++) q.push(100000000 - i);
    t2 = fptime();
    console.log("push:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");
    //console.log(process.memoryUsage());
    // v0.10: 32m/s
    // v5: 48m/s
    // v6: 32m/s

    t1 = fptime();
    for (i=0; i<nloops; i++) x = q.shift(i);
    t2 = fptime();
    console.log("shift:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");

    q = new List();
    for (i=0; i<1000; i++) q.push(i);
    t1 = fptime();
    //for (i=0; i<nloops; i++) { q.push(Math.random() * 10000 | 0); q.shift(); }
    for (i=0; i<nloops; i++) { q.push(100000000 - i); x = q.shift(); }
    t2 = fptime();
    console.log("push/shift:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");

    q = new List();
    for (i=0; i<1000; i++) q.push(i);
    t1 = fptime();
    //for (i=0; i<nloops; i++) q.push(Math.random() * 10000 | 0);
    for (i=0; i<nloops/10; i++) {
        for (var j=0; j<10; j++) q.push(100000000 - j);
        for (var j=0; j<10; j++) x = q.shift();
    }
    t2 = fptime();
    console.log("push/shift ripple 10: %d in %d sec,", nloops, t2-t1, nloops/1000/(t2-t1), "k/s");

    t1 = fptime();
    if (q.peekAt) for (i=0; i<nloops; i++) { x = q.peekAt(0); }
    t2 = fptime();
    console.log("peek: %d in %d sec,", nloops, t2-t1, nloops/1000/(t2-t1), "k/s");
    // v5: peek: 137m/s
    // v5: peekAt: 98m/s

}

package = process.argv[2] || '../index';

List = require(package);

// shims to be able to time other list-like packages
if (package === 'qlist') { }
if (package === 'heap') { List.prototype.shift = List.prototype.pop; }
if (package === 'double-ended-queue') { List.prototype.push = List.prototype.enqueue; List.prototype.shift = List.prototype.dequeue; }
if (package === 'qheap') { }

timeList(List);

console.log(process.memoryUsage())
