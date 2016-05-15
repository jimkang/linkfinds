var config = require('./config');
// var config = require('./test-config');

var Twit = require('twit');
var async = require('async');
var postImage = require('./post-image');
var getRandomLinkImageResult = require('./get-random-link-image-result');

var source = 'wordnik';
var dryRun = false;

if (process.argv.length > 2) {
  if (process.argv[2].toLowerCase() === '--trending-source') {
    source = 'trending';
  }

  dryRun = (process.argv.indexOf('--dry') !== -1);
}

var twit = new Twit(config.twitter);

async.waterfall(
  [
    obtainImage,
    postLinkFindingImage
  ],
  wrapUp
);

function obtainImage(done) {
  var opts = {
    source: source,
    twit: twit,
    config: config
  };
  getRandomLinkImageResult(opts, done);
}

function postLinkFindingImage(linkResult, done) {
  var postImageOpts = {
    twit: twit,
    dryRun: dryRun,
    base64Image: linkResult.base64Image,
    altText: linkResult.concept,
    caption: '♪ DOO DOO DOO DOO! ♪'
  };

  if (source === 'trending') {
    postImageOpts.caption += ' #' + linkResult.concept.replace(/ /g, '');
  }
  postImage(postImageOpts, done);
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
  else {
    // Technically, the user wasn't replied to, but good enough.
    // lastTurnRecord.recordTurn(callOutId, new Date(), reportRecording);
  }
}
