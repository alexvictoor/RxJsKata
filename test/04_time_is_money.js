var Rx = require('rx'),
    Observable = Rx.Observable,
    Subject = Rx.Subject,
    AsyncSubject = Rx.AsyncSubject,
    ReplaySubject = Rx.ReplaySubject,
    TestScheduler = Rx.TestScheduler;


QUnit.module('Time is money');

var __ = 'Fill in the blank';
var onNext = Rx.ReactiveTest.onNext,
  onCompleted = Rx.ReactiveTest.onCompleted,
  subscribe = Rx.ReactiveTest.subscribe;


var createMidPrices = function(source) {
  return __;
}


test('should get mid prices', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable(
    onNext(1, {bid: 42, ask:44}),
    onNext(2, {bid: 44, ask:46})
  );
  var stream = createMidPrices(source, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(1, 43),
    onNext(2, 45)
  ]);
});

var createLastDaysAvgMidPrices = function(source, nbDays, scheduler) {
  return __;
}

test('should get last X  mid avg prices', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable(
    onNext(1, {bid: 42, ask:44}),
    onNext(2, {bid: 44, ask:46}),
    onNext(5, {bid: 43, ask:45}),
    onNext(7, {bid: 45, ask:47})
  );
  var stream = createLastDaysAvgMidPrices(source, 3, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(5, 44),
    onNext(7, 45)
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


