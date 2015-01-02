/**
 * benchmark test rig for list-like data structures
 * that have push() and shift() methods.
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

assert = require('assert');

function fptime() {
    t = process.hrtime();
    return t[0] + t[1] * 1e-9;
}

function timeList( List ) {
    nloops = 1000000;

    t1 = fptime();
    for (i=0; i<nloops; i++) (Math.random() * 1000 | 0);
    t2 = fptime();
    overhead = t2-t1;

    q = new List();
    t1 = fptime();
    for (i=0; i<nloops; i++) q.push(Math.random() * 10000 | 0);
    t2 = fptime() - overhead;
    console.log("push:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");

    //q = new dequeue();
    t1 = fptime();
    for (i=0; i<nloops; i++) q.shift(i);
    t2 = fptime();
    console.log("shift:", nloops, "in", t2-t1, "sec,", nloops/1000/(t2-t1), "k/s");

    q = new List();
    for (i=0; i<1000; i++) q.push(i);
    t1 = fptime();
    for (i=0; i<5*nloops; i++) { q.push(Math.random() * 10000 | 0); q.shift(); }
    t2 = fptime() - overhead;
    console.log("push/shift:", nloops, "in", t2-t1, "sec,", 10*nloops/1000/(t2-t1), "k/s");
}

package = process.argv[2] || 'qlist';

List = require(package);
timeList(List);
