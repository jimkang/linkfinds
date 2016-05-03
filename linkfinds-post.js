var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var probable = require('probable');
var getImageFromConcepts = require('./get-image-from-concepts');
var getLinkFindingImage = require('./get-link-finding-image');
var createWordnok = require('wordnok').createWordnok;
var postImage = require('./post-image');

var source = 'wordnik';
var dryRun = false;

if (process.argv.length > 2 && process.argv[2].toLowerCase() === '--trending-source') {
  source = 'trending';
}

if (process.argv.length > 3) {
  dryRun = (process.argv[3].toLowerCase() === '--dry');
}

var twit = new Twit(config.twitter);
var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

async.waterfall(
  [
    getConcepts,
    getImageFromConcepts,
    getLinkFindingImage,
    postLinkFindingImage
  ],
  wrapUp
);

function getConcepts(done) {
  if (source === 'trending') {
    callNextTick(done, new Error('Not yet implemented.'));
  }
  else {
    var opts = {
      customParams: {
        limit: 5
      }
    };
    wordnok.getRandomWords(opts, done);
  }
}

function postLinkFindingImage(linkResult, done) {
  var postImageOpts = {
    twit: twit,
    dryRun: dryRun,
    base64Image: linkResult.base64Image,
    altText: linkResult.concept,
    caption: 'DOO DOO DOO!'
  };
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
