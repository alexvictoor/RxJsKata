var Rx = require('rx'),
    Observable = Rx.Observable,
    Subject = Rx.Subject,
    AsyncSubject = Rx.AsyncSubject,
    ReplaySubject = Rx.ReplaySubject,
    TestScheduler = Rx.TestScheduler;


QUnit.module('RFS coincidence');

var __ = 'Fill in the blank';
var onNext = Rx.ReactiveTest.onNext,
  onCompleted = Rx.ReactiveTest.onCompleted,
  subscribe = Rx.ReactiveTest.subscribe;

// using the test scheduler to try most powerful rx operators
//
// if there is an execution request matching a price from the "price source"
// then a trade will be generated, otherwise there will be a reject message
//
// TIPS check out join / group join operators
//


var createExecStream = function(priceSource, execReqSource, scheduler) {
  return __;
}



test('should generate trade on execution request when aked price is one of last 3 prices streamed', function() {
  var scheduler = new TestScheduler();
  var priceSource = scheduler.createHotObservable(
    onNext(1, {bid: 42, ask:44}),
    onNext(2, {bid: 44, ask:46}),
    onNext(5, {bid: 43, ask:45}),
    onNext(7, {bid: 45, ask:47})

  );

  var execReqSource = scheduler.createHotObservable(
    onNext(6, {way: "BUY", price: 44})
  );


  var stream = createExecStream(priceSource, execReqSource, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(6, "trade done")
  ]);
});

test('should generate one trade and only one', function() {
  var scheduler = new TestScheduler();
  var priceSource = scheduler.createHotObservable(
    onNext(1, {bid: 42, ask:44}),
    onNext(2, {bid: 44, ask:44}),
    onNext(5, {bid: 43, ask:44}),
    onNext(7, {bid: 42, ask:44})
  );

  var execReqSource = scheduler.createHotObservable(
    onNext(6, {way: "BUY", price: 44})
  );


  var stream = createExecStream(priceSource, execReqSource, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(6, "trade done")
  ]);
});

test('should generate a reject message if asked price not found', function() {
  var scheduler = new TestScheduler();
  var priceSource = scheduler.createHotObservable(
    onNext(1, {bid: 42, ask:44}),
    onNext(2, {bid: 44, ask:44}),
    onNext(5, {bid: 43, ask:44}),
    onNext(7, {bid: 42, ask:44})
  );

  var execReqSource = scheduler.createHotObservable(
    onNext(6, {way: "BUY", price: 40})
  );

  var stream = createExecStream(priceSource, execReqSource, scheduler);
  var mockObserver = scheduler.createObserver();
  stream.subscribe(mockObserver);

  scheduler.start();

  collectionAssert.assertEqual(mockObserver.messages, [
    onNext(6, "reject")
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


