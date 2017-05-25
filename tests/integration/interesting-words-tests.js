/* global __dirname */

var test = require('tape');
var rimraf = require('rimraf');
var level = require('level');
var Sublevel = require('level-sublevel');
var saveWordForUser = require('../../save-word-for-user');
var getInterestingWords = require('../../get-interesting-words');
var config = require('../../config');
var Nounfinder = require('nounfinder');
var queue = require('d3-queue').queue;

// TODO: Maybe make these into non-internet-requiring tests by mocking nounfinder?

var testDbFile = __dirname + '/word-test.db';
rimraf.sync(testDbFile);

var nounfinder = Nounfinder({
  wordnikAPIKey: config.wordnikAPIKey
});

var statelessTestCases = [
  {
    text: 'I poured some of my grenadine on the pavement in memory.',
    maxCommonness: 100,
    expected: [ 'grenadine', 'pavement' ]
  },
  {
    text: 'There are struggles and losses and pursuits and beheadings. All of the pieces crumble, all of the pieces turn dastardly towards (1/2)',
    maxCommonness: 1000,
    expected: [ 'struggle', 'loss', 'pursuit', 'beheading', 'piece' ]
  }
];

var statefulTestCases = [
  {
    text: 'I poured some of my grenadine on the pavement in memory.',
    maxCommonness: 100,
    username: 'smidgeo',
    usedWordsForUsers: {
      smidgeo: ['grenadine'],
      smallcatlabs: ['pavement']
    },
    expected: [ 'pavement' ]
  },
  {
    text: 'There are struggles and losses and pursuits and beheadings. All of the pieces crumble, all of the pieces turn dastardly towards (1/2)',
    maxCommonness: 1000,
    username: 'smallcatlabs',
    usedWordsForUsers: {
      smidgeo: ['grenadine', 'struggle', 'loss'],
      smallcatlabs: ['pavement', 'beheading', 'loss']
    },
    expected: [ 'struggle', 'pursuit', 'piece' ]
  }
];

statelessTestCases.forEach(runStatelessTest);
statefulTestCases.forEach(runStatefulTest);

function runStatelessTest(testCase) {
  test('Stateless test: ' + testCase.text, statelessTest);

  function statelessTest(t) {
    var testDb = Sublevel(level(testDbFile));
    var opts = {
      text: testCase.text,
      username: 'smidgeo',
      maxCommonness: testCase.maxCommonness,
      sublevelDb: testDb,
      nounfinder: nounfinder
    };
    getInterestingWords(opts, checkResult);

    function checkResult(error, words) {
      t.ok(!error, 'No error while getting interesting words.');
      t.deepEqual(words, testCase.expected, 'Correct words filtered.');
      console.log(words);
      testDb.close(t.end);
    }
  }
}

function runStatefulTest(testCase) {
  test('Stateful test: ' + testCase.text, statefulTest);

  function statefulTest(t) {
    setUpDb(testCase.usedWordsForUsers, useDb);

    function useDb(error, testDb) {
      if (error) {
        throw error;
      }
      var opts = {
        text: testCase.text,
        username: testCase.username,
        maxCommonness: testCase.maxCommonness,
        sublevelDb: testDb,
        nounfinder: nounfinder
      };
      getInterestingWords(opts, checkResult);

      function checkResult(error, words) {
        t.ok(!error, 'No error while getting interesting words.');
        t.deepEqual(words, testCase.expected, 'Correct words filtered.');
        console.log(words);
        testDb.close(t.end);
      }
    }
  }
}

function setUpDb(usedWordsForUsers, done) {
  rimraf.sync(testDbFile);
  var testDb = Sublevel(level(testDbFile));

  var q = queue();

  for (var username in usedWordsForUsers) {
    q.defer(saveWordsForUser, testDb, username, usedWordsForUsers[username]);
  }

  q.awaitAll(passDb);

  function passDb(error) {
    done(error, testDb);
  }
}

function saveWordsForUser(testDb, username, words, done) {
  var q = queue();
  words.forEach(queueSaveWord);
  q.awaitAll(done);

  function queueSaveWord(word) {
    var opts = {
      word: word,
      username: username,
      sublevelDb: testDb
    };
    q.defer(saveWordForUser, opts);
  }
}
