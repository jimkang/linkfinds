var config = require('./config');
// var config = require('./test-config');

var Twit = require('twit');
var async = require('async');
var postImage = require('./post-image');
var getRandomLinkImageResult = require('./get-random-link-image-result');
const ComposeLinkScene = require('./compose-link-scene');
const fs = require('fs');

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
    createComposeLinkScene,
    obtainImage,
    postLinkFindingImage
  ],
  wrapUp
);

function createComposeLinkScene(done) {
  ComposeLinkScene({}, done);
}

function obtainImage(composeLinkScene, done) {
  var opts = {
    source: source,
    twit: twit,
    config: config,
    composeLinkScene: composeLinkScene
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

  if (dryRun) {
    const filename = 'would-have-posted-' +
      (new Date()).toISOString().replace(/:/g, '-') +
      '.png';
    console.log('Writing out', filename);
    fs.writeFileSync(filename, postImageOpts.base64Image, {encoding: 'base64'});
    process.exit();
  }
  else {
    postImage(postImageOpts, done);
  }
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
