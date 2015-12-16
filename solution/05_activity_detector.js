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


var createActivityStream_first_solution = function(activity, scheduler) {

  var activityStream = activity.map(
    function(x) {
        return 1;
    }
  ); //.tap(function (x) { console.log("start activity " + x) });

  var endActivityStream = activity.delay(5000, scheduler).map(
    function(x) {
        return -1;
    }
  );  //.tap(function (x) { console.log("end activity " + x) });

  var stream = activityStream
    .merge(endActivityStream)
    //.tap(function (x) { console.log("before sum " + x) })
    .scan(function(x, y) { return x+y; }, 0)
    //.tap(function (x) { console.log("sum change") })
    .map(
      function(x) {
        if (x > 0)  {
          return "green";
        }
        return "red";
      }
    )   //.tap(function (x) { console.log("new color " + x) })
    .distinctUntilChanged();


  var s = new ReplaySubject(1);
  Observable
    .just("red")
    .delay(5000, scheduler)
    .takeUntil(stream).merge(stream)
    //.tap(function (x) { console.log("final color " + x) })
    .subscribe(s);
  return s;  

}


//
// another one leveraging on the switch operator
//

var redAfter5sec = function(scheduler) {
  return Observable
      .just("red")
      .delay(5000, scheduler);
}

var createActivityStream = function(activity, scheduler) {

  var stream = activity.map(function(x) {
    return Observable.just("green")
      .concat(
        redAfter5sec(scheduler)
      );
  }).switch()  // could use also  flatMapLatest 
  .distinctUntilChanged();

  var s = new ReplaySubject(1);
  redAfter5sec(scheduler).takeUntil(stream).merge(stream)
    //.tap(function (x) { console.log("final color " + x) })
    .subscribe(s);
  return s;  
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


