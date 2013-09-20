// a doubly-indexable database with round-robin support

var hasOwn = Object.prototype.hasOwnProperty;

/**
 * A single Entry in the structure.
 *
 * @constructor
 * @param {string} king The king index.
 * @param {string} queen The queen index.
 * @param {*} data The held data.
 */
var Entry = function Entry(king, queen, data) {
  this.data = data;
  this.king = king;
  this.queen = queen;
  this.nextKing = null;
  this.prevKing = null;
  this.nextQueen = null;
  this.prevQueen = null;
};

/**
 * Contains the head and tail of an index King or Queen index Chain.
 *
 * @constructor
 * @param {?Entry} head The head of the Chain.
 * @param {?Entry} tail The tail of the Chain.
 */
var Chain = function Chain(head, tail) {
  this.head = head;
  this.tail = tail;
};

/**
 * The main data structure.
 *
 * @constructor
 */
var DoubleCycle = function DoubleCycle() {
  // map of strings to chains
  this.kings = {};
  // map of strings to chains
  this.queens = {};
};

/**
 * Removes all references to the entry within the datastructure.
 *
 * Time Complexity: O(1)
 *
 * @param {!Entry} entry The entry to dissolve.
 * @this {DoubleCycle}
 * @private
 */
var removeEntry = function(entry) {
  removeKingEntry.call(this, entry);
  removeQueenEntry.call(this, entry);
};

/**
 * Removes all kingly references to the entry within the datastructure.
 *
 * Time Complexity: O(1)
 *
 * @param {!Entry} entry The Entry to dissolve.
 * @this {DoubleCycle}
 * @private
 */
var removeKingEntry = function(entry) {
  var next = entry.nextKing, prev = entry.prevKing;
  if (!next && !prev) {
    delete this.kings[entry.king];
  } else {
    if (next) {
      next.prevKing = prev;
    } else {
      this.kings[entry.king].tail = prev;
    }
    if (prev) {
      prev.nextKing = next;
    } else {
      this.kings[entry.king].head = next;
    }
  }
};

/**
 * Removes all queenly references to the entry within the datastructure.
 *
 * Time Complexity: O(1)
 *
 * @param {!Entry} entry The Entry to dissolve.
 * @this {DoubleCycle}
 * @private
 */
var removeQueenEntry = function(entry) {
  var next = entry.nextQueen, prev = entry.prevQueen;
  if (!next && !prev) {
    delete this.queens[entry.queen];
  } else {
    if (next) {
      next.prevQueen = prev;
    } else {
      this.queens[entry.queen].tail = prev;
    }
    if (prev) {
      prev.nextQueen = next;
    } else {
      this.queens[entry.queen].head = next;
    }
  }
};

/**
 * Inserts data indexed by king and queen keys, no checking for uniqueness.
 *
 * Time Complexity: O(1)
 *
 * @param {string} king The king key.
 * @param {string} queen The queen key.
 * @param {*} data The data to insert.
 * @return {DoubleCycle} This, for chaining.
 * @public
 */
DoubleCycle.prototype.insert = function(king, queen, data) {
  // create a new entry
  // update entry to point to chain heads
  // update previous chain heads with new entry
  // update chains to point to new heads
  var entry = new Entry(king, queen, data);

  var kingChain = this.kings[king], queenChain = this.queens[queen];
  if (kingChain) {
    entry.nextKing = kingChain.head;
    if (kingChain.head) {
      kingChain.head.prevKing = entry;
    }
    kingChain.head = entry;
  } else {
    this.kings[king] = new Chain(entry, entry);
  }
  if (queenChain) {
    entry.nextQueen = queenChain.head;
    if (queenChain.head) {
      queenChain.head.prevQueen = entry;
    }
    queenChain.head = entry;
  } else {
    this.queens[queen] = new Chain(entry, entry);
  }
  return this;
};

/**
 * Replaces all entries with the entries in the provided object by the given
 * king index. This will add, remove or update entries as it sees fit, and it
 * guarantees that all entries will be unique as far as the indexes are
 * concerned.
 *
 * The provided object consists of keys representing a queen index and values
 * representing the corresponding data to be stored.
 *
 * Time Complexity: O(N)
 *
 * @param {string} king The king index to replace.
 * @param {Object.<string, *>} object The mapping to use.
 * @return {DoubleCycle} This, for chaining.
 * @public
 */
DoubleCycle.prototype.replaceKing = function(king, object) {
  var chain = this.kings[king];
  if (!chain) {
    chain = this.kings[king] = new Chain(null, null);
  }
  var knights;
  if (chain.head) {
    // this seems like it's not quite the structure for the job...
    knights = {};
    for (var key in object) {
      knights[key] = object[key];
    }
    for (var entry = chain.head; entry; entry = entry.nextKing) {
      if (hasOwn.call(knights, entry.queen)) {
        entry.data = knights[entry.queen];
        delete knights[entry.queen];
      } else {
        removeEntry.call(this, entry);
      }
    }
  } else {
    knights = object;
  }
  // can't short-circuit to run simpler insert because kings might not exist
  for (var key in knights) {
    this.insert(king, key, knights[key]);
  }
  return this;
};

/**
 * Replaces all entries with the entries in the provided object by the given
 * queen index. This will add, remove or update entries as it sees fit, and it
 * guarantees that all entries will be unique as far as the indexes are
 * concerned.
 *
 * The provided object consists of keys representing a king index and values
 * representing the corresponding data to be stored.
 *
 * Time Complexity: O(N)
 *
 * @param {string} queen The queen index to replace.
 * @param {Object.<string, *>} object The mapping to use.
 * @return {DoubleCycle} This, for chaining.
 * @public
 */
DoubleCycle.prototype.replaceQueen = function(queen, object) {
  var chain = this.queens[queen];
  if (!chain) {
    chain = this.queens[queen] = new Chain(null, null);
  }
  var knights;
  if (chain.head) {
    // this seems like it's not quite the structure for the job...
    knights = {};
    for (var key in object) {
      knights[key] = object[key];
    }
    for (var entry = chain.head; entry; entry = entry.nextQueen) {
      if (hasOwn.call(knights, entry.king)) {
        entry.data = knights[entry.king];
        delete knights[entry.king];
      } else {
        removeEntry.call(this, entry);
      }
    }
  } else {
    knights = object;
  }
  // can't short-circuit to run basic add because kings might not exist
  for (var key in knights) {
    this.insert(key, queen, knights[key]);
  }
  return this;
};

/**
 * Cycles to the next entry in the king queue.
 *
 * Time Complexity: O(1)
 *
 * @param {string} king The king chain to cycle.
 * @return {*} The stored data or undefined.
 * @public
 */
DoubleCycle.prototype.nextKing = function(king) {
  var chain = this.kings[king];
  if (chain && chain.head) {
    if (chain.head.nextKing) {
      chain.tail.nextKing = chain.head;
      chain.head.prevKing = chain.tail;
      chain.tail = chain.head;
      chain.head = chain.head.nextKing;
      chain.head.prevKing = null;
      chain.tail.nextKing = null;
    }
    return chain.tail.data;
  }
  return undefined;
};

/**
 * Cycles to the next entry in the queen queue.
 *
 * Time Complexity: O(1)
 *
 * @param {string} queen The queen chain to cycle.
 * @return {*} The stored data or undefined.
 * @public
 */
DoubleCycle.prototype.nextQueen = function(queen) {
  var chain = this.queens[queen];
  if (chain && chain.head) {
    if (chain.head.nextQueen) {
      chain.tail.nextQueen = chain.head;
      chain.head.prevQueen = chain.tail;
      chain.tail = chain.head;
      chain.head = chain.head.nextQueen;
      chain.head.prevQueen = null;
      chain.tail.nextQueen = null;
    }
    return chain.tail.data;
  }
  return undefined;
};

/**
 * Gets the last-used king for the given queen.
 *
 * Time Complexity: O(1)
 *
 * @param {string} queen The queen to look up.
 * @return {string} The king last used or undefined.
 * @public
 */
DoubleCycle.prototype.lastKing = function(queen) {
  var chain = this.queens[queen];
  if (chain && chain.tail) {
    return chain.tail.king;
  }
  return undefined;
};

/**
 * Gets the last-used queen for the given king.
 *
 * Time Complexity: O(1)
 *
 * @param {string} king The king to look up.
 * @return {string} The queen last used or undefined.
 * @public
 */
DoubleCycle.prototype.lastQueen = function(king) {
  var chain = this.kings[king];
  if (chain && chain.tail) {
    return chain.tail.queen;
  }
  return undefined;
};

/**
 * Remove all entries that have the given king index.
 *
 * Time Complexity: O(N)
 *
 * @param {string} king The king chain to remove.
 * @return {DoubleCycle} This, for chaining.
 * @public
 */
DoubleCycle.prototype.removeKing = function(king) {
  // decouple queens
  // rewire queen ends
  // decouple king
  var chain = this.kings[king];
  if (chain) {
    for (var entry = chain.head; entry; entry = entry.nextKing) {
      removeQueenEntry.call(this, entry);
    }
    delete this.kings[king];
  }
  return this;
};

/**
 * Remove all entries that have the given queen index.
 *
 * Time Complexity: O(N)
 *
 * @param {string} queen The queen chain to remove.
 * @return {DoubleCycle} This, for chaining.
 * @public
 */
DoubleCycle.prototype.removeQueen = function(queen) {
  // decouple kings
  // rewire king ends
  // decouple queen
  var chain = this.queens[queen];
  if (chain) {
    for (var entry = chain.head; entry; entry = entry.nextQueen) {
      removeKingEntry.call(this, entry);
    }
    delete this.queens[queen];
  }
  return this;
};

/**
 * Get or set the metadata for a given king.
 *
 * If meta is undefined (i.e. the methods is called with one parameter), this
 * retrieves the value.
 *
 * Time Complexity: O(1)
 *
 * @param {string} king The king.
 * @param {*} meta The metadata.
 * @public
 */
DoubleCycle.prototype.metaKing = function(king, meta) {
  var chain = this.kings[king];
  if (meta === undefined) {
    return chain ? chain.meta : undefined;
  }
  if (!chain) {
    chain = this.kings[king] = new Chain(null, null);
  }
  chain.meta = meta;
  return this;
};

/**
 * Get or set the metadata for a given queen.
 *
 * If meta is undefined (i.e. the methods is called with one parameter), this
 * retrieves the value.
 *
 * Time Complexity: O(1)
 *
 * @param {string} queen The queen.
 * @param {*} meta The metadata.
 * @public
 */
DoubleCycle.prototype.metaQueen = function(queen, meta) {
  var chain = this.queens[queen];
  if (meta === undefined) {
    return chain ? chain.meta : undefined;
  }
  if (!chain) {
    chain = this.queens[queen] = new Chain(null, null);
  }
  chain.meta = meta;
  return this;
};

/**
 * Constructs a new DoubleCycle.
 *
 * @return {DoubleCycle} The constructed instance.
 */
var createDoubleCycle = function createDoubleCycle() {
  return new DoubleCycle();
};

createDoubleCycle.DoubleCycle = DoubleCycle;
module.exports = createDoubleCycle;
