var async = require('async');
var getImageFromConcepts = require('./get-image-from-concepts');
var getLinkFindingImage = require('./get-link-finding-image');
var createWordnok = require('wordnok').createWordnok;
var pluck = require('lodash.pluck');
var probable = require('probable');

function getRandomLinkImageResult(opts, allDone) {
  var source;
  var twit;
  var config;

  if (opts) {
    source = opts.source;
    twit = opts.twit;
    config = opts.config;
  }

  var wordnok = createWordnok({
    apiKey: config.wordnikAPIKey
  });

  async.waterfall(
    [
      getConcepts,
      getImageFromConcepts,
      getLinkFindingImage
    ],
    allDone
  );

  function getConcepts(done) {
    if (source === 'trending') {
      var params = {
        id: 1 //1 is "Worldwide"
      };
      twit.get('trends/place', params, extractTrends);
    }
    else {
      var opts = {
        customParams: {
          limit: 5
        }
      };
      wordnok.getRandomWords(opts, done);
    }

    function extractTrends(error, data, response) {
      if (error) {
        done(error);
      }
      else {
        var trendNames = pluck(data[0].trends.slice(0, 10), 'name');
        done(null, probable.shuffle(trendNames));
      }
    }
  }
}

module.exports = getRandomLinkImageResult;
