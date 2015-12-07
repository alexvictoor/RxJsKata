var Rx = require('rx'),
    Observable = Rx.Observable,
    Subject = Rx.Subject,
    AsyncSubject = Rx.AsyncSubject,
    ReplaySubject = Rx.ReplaySubject;


QUnit.module('Test buddy');

var __ = 'Fill in the blank';
var onNext = Rx.ReactiveTest.onNext,
  onCompleted = Rx.ReactiveTest.onCompleted,
  subscribe = Rx.ReactiveTest.subscribe;









test('meet your new best friend', function () {
  var scheduler = new Rx.TestScheduler();

  // Create hot observable which will start firing
  var source = scheduler.createHotObservable(
    onNext(300, "Hello"),
    onNext(342, "Go"),
    onCompleted(400)
  );

  var res = scheduler.startScheduler(function () {
    return source.map(function (x) { return x + " Rx!"; });
  });

  collectionAssert.assertEqual(res.messages, [
    onNext(300, "Hello Rx!"),  // __
    onNext(342, "Go Rx!"),  // __
    onCompleted(400)
  ]);

});

test('too soon or too late', function () {
  var scheduler = new Rx.TestScheduler();

  // Create hot observable which will start firing
  var xs = scheduler.createHotObservable(
    onNext(75, "Hello"),
    onCompleted(150)
  );

  // Note we'll start at 200 for subscribe, hence missing the 150 mark
  var res = scheduler.startScheduler(function () {
    return xs.map(function (x) { return x; });
  }/* ,{
    created: 100,     
    subscribed: 200
  }*/);

  collectionAssert.assertEqual(res.messages, [
    onNext(75, "Hello"),
    onCompleted(150)
  ]);

  // Check for subscribe/unsubscribe
  collectionAssert.assertEqual(xs.subscriptions, [
    subscribe(60, 150)
  ]);
});


test('moving forward, automatic way', function() {

  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1).take(3);

  var mockObserver = scheduler.createObserver();
  source.subscribe(mockObserver);

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(150, 1),
    onNext(250, 2),  // __
    onNext(350, 3),
    onCompleted(350)
  ]);

})

test('moving forward, manual way', function() {

  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1).take(3);

  var mockObserver = scheduler.createObserver();
  source.subscribe(mockObserver);

  scheduler.advanceBy(200); // __

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(150, 1) 
  ]);

  scheduler.advanceBy(200); // __ relative ftw!

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(150, 1),
    onNext(250, 2),
    onNext(350, 3),
    onCompleted(350)
  ]);

})

test('in search of the absolute', function() {

  var scheduler = new Rx.TestScheduler();

  // Create hot observable which will start firing
  var source = scheduler.createHotObservable(
    onNext(300, "Black"),
    onNext(400, "White"),
    onCompleted(500)
  );

  var mockObserver = scheduler.createObserver();
  
  scheduler.scheduleAbsolute(null, 350, function () {
    source.subscribe(mockObserver);
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(400, "White"), // __
    onCompleted(500)  // __
  ]);

})

 

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


