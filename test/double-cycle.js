var create = require('..');
var expect = require('expect.js');
var crypto = require('crypto');

describe('DoubleCycle', function() {
  var cycle;

  beforeEach(function() {
    cycle = create();
  });

  describe('#insert', function() {
    it('should insert the specified entry', function() {
      var entry = {hello: 'world'};
      cycle.insert('king', 'queen', entry);

      expect(cycle.nextKing('king')).to.equal(entry);
      expect(cycle.nextKing('king')).to.equal(entry);
      expect(cycle.nextQueen('queen')).to.equal(entry);
      expect(cycle.nextQueen('queen')).to.equal(entry);
    });

    it('should not replace existing entries', function() {
      var entry = {hello: 'world'}, next = {hello: 'world'};
      cycle.insert('king', 'queen', entry);
      cycle.insert('king', 'queen', next);

      expect(cycle.nextKing('king')).to.equal(next);
      expect(cycle.nextKing('king')).to.equal(entry);
      expect(cycle.nextKing('king')).to.equal(next);
      expect(cycle.nextQueen('queen')).to.equal(next);
      expect(cycle.nextQueen('queen')).to.equal(entry);
      expect(cycle.nextQueen('queen')).to.equal(next);
    });

    xit('should insert all the specified entries', function() {
      var kings = crypto.randomBytes(10), queens = crypto.randomBytes(10);

      for (var k = 0; k < 10; k++) {
        for (var q = 0; q < 10; q++) {
          cycle.insert(k, q, {entry: k * 10 + q});
        }
      }

      // how do we check that?
    });
  });

  describe('#replace', function() {
    it('should insert where none exist', function() {
      var things = new Array(2);
      cycle.replaceKing('123', {
        'abc': things[0] = {thing: 1},
        'bcd': things[1] = {thing: 2}
      });

      expect(cycle.nextKing('123')).to.equal(things[1]);
      expect(cycle.nextKing('123')).to.equal(things[0]);
    });

    it('should replace the specified entries', function() {
      var things = new Array(4);
      cycle.insert('123', 'abc', things[0] = {thing: 1});
      cycle.insert('123', 'bcd', things[1] = {thing: 2});
      cycle.insert('234', 'abc', things[2] = {thing: 3});
      cycle.insert('234', 'bcd', things[3] = {thing: 4});

      expect(cycle.nextKing('123')).to.equal(things[1]);
      expect(cycle.nextKing('234')).to.equal(things[3]);

      cycle.replaceKing('123', {
        'bcd': things[0] = {thing: 5},
        'cde': things[1] = {thing: 6}
      });

      expect(cycle.nextKing('123')).to.equal(things[1]);
      expect(cycle.nextKing('123')).to.equal(things[0]);
      expect(cycle.nextKing('123')).to.equal(things[1]);
      expect(cycle.nextKing('234')).to.equal(things[2]);

      expect(cycle.nextQueen('abc')).to.equal(things[2]);
      expect(cycle.nextQueen('abc')).to.equal(things[2]);

      things.unshift({thing: 7});
      cycle.replaceQueen('abc', {
        '123': things[0],
        '234': things[3] = {thing: 8}
      });

      expect(cycle.nextQueen('abc')).to.equal(things[0]);
      expect(cycle.nextQueen('abc')).to.equal(things[3]);
      expect(cycle.nextQueen('abc')).to.eql({thing: 7});
      expect(cycle.nextQueen('abc')).to.eql({thing: 8});
    });
  });

  describe('#next', function() {
    it('should cycle only the specified chain', function() {
      var things = new Array(5);
      cycle.insert('123', 'abc', things[0] = {thing: 1});
      cycle.insert('123', 'bcd', things[1] = {thing: 2});
      cycle.insert('234', 'abc', things[2] = {thing: 3});
      cycle.insert('234', 'bcd', things[3] = {thing: 4});
      cycle.insert('234', 'bcd', things[4] = {thing: 5});

      expect(cycle.nextKing('123')).to.equal(things[1]);
      expect(cycle.nextKing('123')).to.equal(things[0]);
      expect(cycle.nextKing('123')).to.equal(things[1]);

      expect(cycle.nextKing('234')).to.equal(things[4]);
      expect(cycle.nextKing('234')).to.equal(things[3]);
      expect(cycle.nextKing('234')).to.equal(things[2]);
      expect(cycle.nextKing('234')).to.equal(things[4]);

      expect(cycle.nextQueen('abc')).to.equal(things[2]);
      expect(cycle.nextQueen('abc')).to.equal(things[0]);
      expect(cycle.nextQueen('abc')).to.equal(things[2]);

      expect(cycle.nextQueen('bcd')).to.equal(things[4]);
      expect(cycle.nextQueen('bcd')).to.equal(things[3]);
      expect(cycle.nextQueen('bcd')).to.equal(things[1]);
    });
  });

  describe('#last', function() {
    it('should return the last-used key or undefined', function() {
      cycle.insert('123', 'abc', {thing: 1});
      cycle.insert('123', 'bcd', {thing: 2});
      cycle.insert('234', 'abc', {thing: 3});
      cycle.insert('234', 'bcd', {thing: 4});

      cycle.nextKing('123');
      expect(cycle.lastQueen('123')).to.equal('bcd');
      expect(cycle.lastQueen('123')).to.equal('bcd');
      cycle.nextKing('123');
      expect(cycle.lastQueen('123')).to.equal('abc');

      cycle.nextQueen('abc');
      expect(cycle.lastKing('abc')).to.equal('234');
      expect(cycle.lastKing('abc')).to.equal('234');
      cycle.nextQueen('abc');
      expect(cycle.lastKing('abc')).to.equal('123');
    });
  });

  describe('#remove', function() {
    it('should remove all relevant entries', function() {
      var things = new Array(4);
      cycle.insert('123', 'abc', things[0] = {thing: 1});
      cycle.insert('123', 'bcd', things[1] = {thing: 2});
      cycle.insert('234', 'abc', things[2] = {thing: 3});
      cycle.insert('234', 'bcd', things[3] = {thing: 4});

      cycle.removeKing('123');

      expect(cycle.nextKing('123')).to.equal(undefined);
      expect(cycle.nextKing('234')).to.equal(things[3]);
      expect(cycle.nextKing('234')).to.equal(things[2]);
      expect(cycle.nextQueen('abc')).to.equal(things[2]);
      expect(cycle.nextQueen('abc')).to.equal(things[2]);
      expect(cycle.nextQueen('bcd')).to.equal(things[3]);
      expect(cycle.nextQueen('bcd')).to.equal(things[3]);

      cycle.insert('123', 'abc', things[0] = {thing: 5});
      cycle.insert('123', 'bcd', things[1] = {thing: 6});

      cycle.removeQueen('bcd');

      expect(cycle.nextQueen('bcd')).to.equal(undefined);
      expect(cycle.nextQueen('abc')).to.equal(things[0]);
      expect(cycle.nextQueen('abc')).to.equal(things[2]);
      expect(cycle.nextKing('123')).to.equal(things[0]);
      expect(cycle.nextKing('123')).to.equal(things[0]);
      expect(cycle.nextKing('234')).to.equal(things[2]);
      expect(cycle.nextKing('234')).to.equal(things[2]);
    });
  });

  describe('#meta', function() {
    it('should stick around appropriately', function() {
      cycle.insert('123', 'abc', {thing: 1});
      cycle.insert('123', 'bcd', {thing: 2});
      cycle.insert('234', 'abc', {thing: 3});
      cycle.insert('234', 'bcd', {thing: 4});

      cycle.metaKing('123', 'hello');
      expect(cycle.metaKing('123')).to.equal('hello');
      cycle.metaKing('123', 'things');
      expect(cycle.metaKing('123')).to.equal('things');

      cycle.removeQueen('abc');
      expect(cycle.metaKing('123')).to.equal('things');
      cycle.removeQueen('bcd');
      expect(cycle.metaKing('123')).to.equal(undefined);

      cycle.removeKing('234');
      expect(cycle.metaKing('123')).to.equal(undefined);
      cycle.removeKing('123');
      expect(cycle.metaKing('123')).to.equal(undefined);
    });
  });
});
