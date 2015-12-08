var Rx = require('rx'),
    Observable = Rx.Observable,
    Subject = Rx.Subject,
    AsyncSubject = Rx.AsyncSubject,
    ReplaySubject = Rx.ReplaySubject,
    TestScheduler = Rx.TestScheduler;


QUnit.module('Activity detector');

var __ = 'Fill in the blank';
var onNext = Rx.ReactiveTest.onNext,
  onCompleted = Rx.ReactiveTest.onCompleted,
  subscribe = Rx.ReactiveTest.subscribe;


var createActivityStream = function(activity, scheduler) {

  return __;
}


test('should get a red signal after 5sec of inactivity', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable();
  var stream = createActivityStream(source, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.advanceBy(5000);

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(5000, "red")
  ]);
});

test('should get a green signal after activity', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable(
      onNext(1000, "click")
  );
  var stream = createActivityStream(source, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.advanceBy(5000);

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(1000, "green")
  ]);
});

test('should get a red signal after a green signal and then 5sec of inactivity', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable(
    onNext(1000, "click")
  );
  var stream = createActivityStream(source, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.advanceBy(6000);

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(1000, "green"),
    onNext(6000, "red")
  ]);
});

test('should get a green signal after a red signal if there is activity', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable(
    onNext(1000, "click"),
    onNext(7000, "click")
  );
  var stream = createActivityStream(source, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.advanceBy(7100);

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(1000, "green"),
    onNext(6000, "red"),
    onNext(7000, "green")
  ]);
});

test('should get a red signal subscribing after 6sec of inactivity', function() {
  // tip: use a ReplaySubject
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable();
  var stream = createActivityStream(source, scheduler);
  var mockObserver = scheduler.createObserver();
  
  scheduler.advanceBy(6000);
  stream.subscribe(mockObserver);

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(6000, "red")
  ]);
});

test('should send signal only when value changes', function() {
  var scheduler = new TestScheduler();
  var source = scheduler.createHotObservable(
    onNext(1000, "click"),
    onNext(4000, "click")
  );
  var stream = createActivityStream(source, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);
  scheduler.advanceBy(8000);
  
  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(1000, "green")
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


