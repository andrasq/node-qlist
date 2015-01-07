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
    nloops = 100000;

    var x;
    for (i=0; i<10000; i++) x = fptime();

    q = new List();
    t1 = fptime();
    for (i=0; i<nloops; i++) q.push(Math.random() * 10000 | 0);
    //for (i=0; i<nloops; i++) q.push(100000000 - i);
    t2 = fptime();
    console.log("push:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");

    t1 = fptime();
    for (i=0; i<nloops; i++) q.shift(i);
    t2 = fptime();
    console.log("shift:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");

    q = new List();
    for (i=0; i<1000; i++) q.push(i);
    t1 = fptime();
    for (i=0; i<nloops; i++) { q.push(Math.random() * 10000 | 0); q.shift(); }
    //for (i=0; i<nloops; i++) { q.push(100000000 - i); q.shift(); }
    t2 = fptime();
    console.log("push/shift:", nloops, "in", t2-t1, "sec,", 10*nloops/1000/(t2-t1), "k/s");
}

package = process.argv[2] || '../index';

List = require(package);

// shims to be able to time other list-like packages
if (package === 'qlist') { }
if (package === 'heap') { List.prototype.shift = List.prototype.pop; }
if (package === 'double-ended-queue') { List.prototype.push = List.prototype.enqueue; List.prototype.shift = List.prototype.dequeue; }
if (package === 'qheap') { }

timeList(List);
