var compact = require('lodash.compact');
var async = require('async');
var queue = require('d3-queue').queue;

function getInterestingWords(opts, allDone) {
  var text;
  var username;
  var maxCommonness;
  var sublevelDb;
  var nounfinder;

  if (opts) {
    text = opts.text;
    username = opts.username;
    maxCommonness = opts.maxCommonness;
    sublevelDb = opts.sublevelDb;
    nounfinder = opts.nounfinder; 
  }

  var usedWords = sublevelDb.sublevel('used-words').sublevel(username);

  async.waterfall(
    [
      getNouns,
      filterForInterestingness,
      filterOutUsedWords
    ],
    allDone
  );

  function getNouns(done) {
    nounfinder.getNounsFromText(text, done);
  }

  function filterForInterestingness(nouns, done) {
    nounfinder.filterNounsForInterestingness(nouns,  maxCommonness, done);
  }

  function filterOutUsedWords(words, done) {
    var q = queue();
    words.forEach(queueWordLookup);
    q.awaitAll(compactUnusedWords)

    function queueWordLookup(word) {
      q.defer(lookUpWord, word);
    }

    function compactUnusedWords(error, unusedWords) {
      if (error) {
        done(error);
      }
      else {
        done(error, compact(unusedWords));
      }
    }
  }

  function lookUpWord(word, done) {
    usedWords.get(word, checkResult);

    function checkResult(error, dateString) {
      if (error) {
        // Don't pass on a NotFoundError. That's just telling us we have not used the word.
        if (error.type === 'NotFoundError') {
          done(null, word);
        }
        else {
          done(error);
        }
      }
      else {
        // Pass back nothing (effectively filtering out the word, if the word has been found).
        done();
      }
    }
  }
}

module.exports = getInterestingWords;
