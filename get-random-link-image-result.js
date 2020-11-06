var async = require('async');
var getImageFromConcepts = require('./get-image-from-concepts');
var GetLinkFindingImage = require('./get-link-finding-image');
var createWordnok = require('wordnok').createWordnok;

function getRandomLinkImageResult(opts, allDone) {
  var config;
  var composeLinkScene;

  if (opts) {
    config = opts.config;
    composeLinkScene = opts.composeLinkScene;
  }

  const getLinkFindingImage = GetLinkFindingImage({
    config: config,
    composeLinkScene: composeLinkScene
  });

  var wordnok = createWordnok({
    apiKey: config.wordnikAPIKey
  });

  async.waterfall(
    [getConcepts, getImageFromConcepts, getLinkFindingImage],
    allDone
  );

  function getConcepts(done) {
    var opts = {
      customParams: {
        limit: 5
      }
    };
    wordnok.getRandomWords(opts, done);
  }
}

module.exports = getRandomLinkImageResult;
