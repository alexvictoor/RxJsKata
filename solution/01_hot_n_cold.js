var Rx = require('rx'),
    Observable = Rx.Observable,
    Subject = Rx.Subject,
    AsyncSubject = Rx.AsyncSubject,
    ReplaySubject = Rx.ReplaySubject;


QUnit.module('Hot n Cold');

var __ = 'Fill in the blank';
var onNext = Rx.ReactiveTest.onNext,
  onCompleted = Rx.ReactiveTest.onCompleted,
  subscribe = Rx.ReactiveTest.subscribe;







asyncTest('some like it hot', function () {
  
  var subject = new Subject();

  setTimeout(function () {
    subject.onNext(1);
    subject.onNext(2);
    subject.onNext(3);
  }, 150);
  
  setTimeout(function () {
    subject.onNext(4);
  }, 210);

  var hotObservable = subject;

  var result = [];
  setTimeout(function () {
    hotObservable.subscribe(
      function(x) {
        result.push(x);
      }
    );
  }, 100);

  setTimeout(function () {
    hotObservable.subscribe(
      function(x) {
        result.push(x);
      }
    );
  }, 200);
  
  setTimeout(function () {
    collectionAssert.assertEqual(result, [
      1, 2, 3, 4, 4 // __
    ]);
    start();
  }, 300);


});

asyncTest('some like it cold', function () {
  
  
  var coldObservable = Observable.create(function (observer) {
    observer.onNext(1);
    observer.onNext(2);
    observer.onNext(3);
  });

  var result = [];

  setTimeout(function () {
    coldObservable.subscribe(
      function(x) {
        result.push(x);
      }
    );
  }, 100);

  setTimeout(function () {
    coldObservable.subscribe(
      function(x) {
        result.push(x);
      }
    );
  }, 200);
  
  setTimeout(function () {
    collectionAssert.assertEqual(result, [
      1, 2, 3, 1, 2, 3 // __
    ]);
    start();
  }, 300);


});



test('hot or cold?', function () {
  
  var xs = new AsyncSubject();
  var result1 = [];
  xs.subscribe(
    function(x) {
      result1.push(x);
    }
  );
  xs.onNext("hot");
  xs.onNext("cold");
  var result2 = [];
  xs.subscribe(
    function(x) {
      result2.push(x);
    }
  );
  xs.onNext("hot");
  xs.onNext("cold");
  xs.onNext("warm?");
  xs.onCompleted();

  collectionAssert.assertEqual(result1, [
    "warm?" // __
  ]);

  collectionAssert.assertEqual(result2, [
    "warm?" // __
  ]);

});


test('should be cool now', function () {
  
  
  var xs = new ReplaySubject();
  

  var result1 = [];
  xs.subscribe(
    function(x) {
      result1.push(x);
    }
  );
  xs.onNext(1);
  xs.onNext(2);
  var result2 = [];
  xs.subscribe(
    function(x) {
      result2.push(x);
    }
  );
  xs.onNext(3);
  xs.onNext(4);

  collectionAssert.assertEqual(result1, [
    1, 2, 3, 4 // __
  ]);

  collectionAssert.assertEqual(result2, [
    1, 2, 3, 4 // __
  ]);

});
















function createMessage(expected, actual) {
  return 'Expected: [' + expected.toString() + ']\r\nActual: [' + actual.toString() + ']';
}

// Using QUnit testing for assertions
var collectionAssert = {
  assertEqual: function (actual, expected) {
    var comparer = Rx.internals.isEqual, isOk = true;

    if (expected.length !== actual.length) {
      ok(false, 'Not equal length. Expected: ' + expected.length + ' Actual: ' + actual.length);
      return;
    }

    for(var i = 0, len = expected.length; i < len; i++) {
      isOk = comparer(expected[i], actual[i]);
      if (!isOk) {
        break;
      }
    }

    ok(isOk, createMessage(expected, actual));
  }
};


