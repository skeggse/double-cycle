double-cycle
============

A specialized datastructure with double indexing and queue-based entry cycling.

_Note:_ the indexes are not really unique, and inserting a single entry into the structure which already exists in the structure will create duplicates. To avoid this, you can use the `replaceKing` or `replaceQueen` methods, which force an entire king or queen chain to match the provided mappings.

Install
=======

[npm][]
-------

```sh
$ npm install double-cycle
```

[github][]
----------

```sh
$ git clone https://github.com/skeggse/double-cycle.git
```

Test
====

Run any of the following.

```
$ mocha
$ npm test
$ make test
```

_remember to_ `npm install`!

API
===

The `king` and `queen` parameters to most of these methods are designed to take strings, or Objects which are unique when converted to strings. These parameters are the keys for the King and Queen indexes within the datastructure.

insert(king, queen, object)
---------------------------

Inserts an object into the datastructure (no duplicate checking), and indexes the object by the `king` and `queen` parameters.

Time Complexity: O(1)

```js
var create = require('double-cycle');
var cycle = create();

// these insert items into the structure
cycle.insert('123', 'abc', {thing: 1});
cycle.insert('123', 'bcd', {thing: 2});
cycle.insert('234', 'abc', {thing: 3});
cycle.insert('234', 'bcd', {thing: 4});
cycle.insert('234', 'bcd', {thing: 5}); // this does not replace the last insert

// cycle now contains five entries, indexable by two kings and two queens
```

replaceKing|Queen(king|queen, object)
-------------------------------------

Replaces all entries with the entries in the provided object by the given king or queen index. This will add, remove or update entries as it sees fit, and it guarantees that all entries will be unique as far as the indexes are concerned.

The provided object consists of keys representing a queen index and values representing the corresponding data to be stored.

Time Complexity: O(N)

```js
var create = require('double-cycle');
var cycle = create();

cycle.insert('123', 'abc', {thing: 1});
cycle.insert('123', 'bcd', {thing: 2});
cycle.insert('234', 'abc', {thing: 3});
cycle.insert('234', 'bcd', {thing: 4});

cycle.replaceKing('234', {
  'abc': {thing: 5},
  'cde': {thing: 6}
});

// cycle now contains four items:

// 123/abc/{thing: 1}
// 123/bcd/{thing: 2}
// 234/abc/{thing: 5}
// 234/bcd/{thing: 6}
```

nextKing|Queen(king|queen)
--------------------------

Retrieves the next entry in the sequence for the given king of queen. This effectively allows any key to be a round-robin queue, especially useful for delegating to known instances of services.

This function does not alter the entries stored in the structure, it only rotates the relevant chain.

Time Complexity: O(1)

```js
var create = require('double-cycle');
var cycle = create();

cycle.insert('123', 'abc', {thing: 1});
cycle.insert('123', 'bcd', {thing: 2});
cycle.insert('234', 'abc', {thing: 3});
cycle.insert('234', 'bcd', {thing: 4});

cycle.nextKing('123'); // {thing: 2}
cycle.nextKing('123'); // {thing: 1}
cycle.nextKing('123'); // {thing: 2}
```

removeKing|Queen(king|queen)
----------------------------

Removes all entries indexed by the given king or queen.

Time Complexity: O(N)

```js
var create = require('double-cycle');
var cycle = create();

cycle.insert('123', 'abc', {thing: 1});
cycle.insert('123', 'bcd', {thing: 2});
cycle.insert('234', 'abc', {thing: 3});
cycle.insert('234', 'bcd', {thing: 4});

cycle.removeKing('123');

// cycle now contains two items:

// 234/abc/{thing: 3}
// 234/bcd/{thing: 4}
```

Extended Example
================

Let's say you have a bunch of Node processes, and each of which exposes a number of services. You're in charge of discovering said processes and assigning them unique identifiers, but once you have their capabilities you can easily keep an up-to-date registry of known services with round-robin access using double-cycle:

```js
var create = require('double-cycle');
var registry = create();

// call this when you discover a new process
var discovered = function(processid, capabilities) {
  registry.replaceKing(processid, capabilities);
};

// call this when a process's capabilities change
var updated = function(processid, capabilities) {
  registry.updateKing(processid, capabilities);
};

// call this when a process is shutting down
var destroyed = function(processid) {
  registry.removeKing(processid);
};

// call this when you want to communicate with an arbitrary
var dispatch = function(service) {
  return registry.nextQueen(service);
};
```

All of these functions really just pass through to `registry`'s methods, so they're unnecessary. They simply exist to demonstate the use-case.

More Examples
=============

```js
var create = require('double-cycle');
var cycle = create();

// these insert items into the structure
cycle.insert('123', 'abc', {thing: 1});
cycle.insert('123', 'bcd', {thing: 2});
cycle.insert('234', 'abc', {thing: 3});
cycle.insert('234', 'bcd', {thing: 4});
cycle.insert('234', 'bcd', {thing: 5}); // this does not replace the last insert

cycle.nextKing('123'); // {thing: 2}
cycle.nextKing('123'); // {thing: 1}
cycle.nextKing('123'); // {thing: 2}

cycle.nextKing('234'); // {thing: 5}
cycle.nextKing('234'); // {thing: 4}
cycle.nextKing('234'); // {thing: 3}
cycle.nextKing('234'); // {thing: 5}

cycle.nextQueen('abc'); // {thing: 3}
cycle.nextQueen('abc'); // {thing: 1}
cycle.nextQueen('abc'); // {thing: 3}

cycle.nextQueen('bcd'); // {thing: 5}
cycle.nextQueen('bcd'); // {thing: 4}
cycle.nextQueen('bcd'); // {thing: 2}
```

Browser Compatibility
=====================

It might work! Designed only for a Node runtime environment, however.

Unlicense / Public Domain
=========================

> This is free and unencumbered software released into the public domain.

> Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

> In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

> For more information, please refer to <[http://unlicense.org/](http://unlicense.org/)>

[npm]: http://npmjs.org/package/double-cycle "double-cycle on npm"
[github]: https://github.com/skeggse/double-cycle "double-cycle on github"
