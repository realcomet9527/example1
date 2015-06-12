/* eslint-disable no-process-exit */
require('dotenv').load();
var Rx = require('rx'),
    uuid = require('node-uuid'),
    assign = require('lodash/object/assign'),
    mongodb = require('mongodb'),
    secrets = require('../config/secrets');

var MongoClient = mongodb.MongoClient;

var providers = [
  'facebook',
  'twitter',
  'google',
  'github',
  'linkedin'
];

function createConnection(URI) {
  return Rx.Observable.create(function(observer) {
    MongoClient.connect(URI, function(err, database) {
      if (err) {
        return observer.onError(err);
      }
      observer.onNext(database);
    });
  });
}

function createQuery(db, collection, options, batchSize) {
  return Rx.Observable.create(function (observer) {
    console.log('Creating cursor...');
    var cursor = db.collection(collection).find({}, options);
    cursor.batchSize(batchSize || 20);
    // Cursor.each will yield all doc from a batch in the same tick,
    // or schedule getting next batch on nextTick
    cursor.each(function (err, doc) {
      if (err) {
        return observer.onError(err);
      }
      if (!doc) {
        return observer.onCompleted();
      }
      observer.onNext(doc);
    });

    return Rx.Disposable.create(function () {
      console.log('Disposing cursor...');
      cursor.close();
    });
  });
}

function insertMany(db, collection, users, options) {
  return Rx.Observable.create(function(observer) {
    db.collection(collection).insertMany(users, options, function(err) {
      if (err) {
        return observer.onError(err);
      }
      observer.onNext();
      observer.onCompleted();
    });
  });
}

var count = 0;
// will supply our db object
var dbObservable = createConnection(secrets.db).shareReplay();

var users = dbObservable
  .flatMap(function(db) {
    // returns user document, n users per loop where n is the batchsize.
    return createQuery(db, 'users', {});
  })
  .map(function(user) {
    // flatten user
    assign(user, user.portfolio, user.profile);
    return user;
  })
  .map(function(user) {
    if (user.username) {
      return user;
    }
    user.username = 'fcc' + uuid.v4().slice(0, 8);
    return user;
  })
  .shareReplay();

// batch them into arrays of twenty documents
var userSavesCount = users
  .bufferWithCount(20)
  // get bd object ready for insert
  .withLatestFrom(dbObservable, function(users, db) {
    return {
      users: users,
      db: db
    };
  })
  .flatMap(function(dats) {
    // bulk insert into new collection for loopback
    return insertMany(dats.db, 'user', dats.users, { w: 1 });
  })
  // count how many times insert completes
  .count();

// create User Identities
var userIdentityCount = users
  .flatMap(function(user) {
    var ids = providers
      .map(function(provider) {
        return {
          provider: provider,
          externalId: user[provider]
        };
      })
      .filter(function(ident) {
        return !!ident.externalId;
      });

    return Rx.Observable.from(ids);
  })
  .bufferWithCount(20)
  .withLatestFrom(dbObservable, function(identities, db) {
    return {
      identities: identities,
      db: db
    };
  })
  .flatMap(function(dats) {
    // bulk insert into new collection for loopback
    return insertMany(dats.db, 'userIdentity', dats.identities, { w: 1 });
  })
  // count how many times insert completes
  .count();

Rx.Observable.merge(
  userIdentityCount,
  userSavesCount
)
  .subscribe(
    function(_count) {
      count += _count * 20;
    },
    function(err) {
      console.log('an error occured', err);
    },
    function() {
      console.log('finished with %s documents processed', count);
    }
  );
