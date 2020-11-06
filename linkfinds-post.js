var config = require('./config');
// var config = require('./test-config');

var async = require('async');
var getRandomLinkImageResult = require('./get-random-link-image-result');
var dooDooDooDoo = require('./doo-doo-doo-doo');
var ComposeLinkScene = require('./compose-link-scene');
var randomId = require('idmaker').randomId;
var postIt = require('@jimkang/post-it');

async.waterfall([createComposeLinkScene, obtainImage, postToTargets], wrapUp);

function createComposeLinkScene(done) {
  ComposeLinkScene({}, done);
}

function obtainImage(composeLinkScene, done) {
  var opts = {
    composeLinkScene,
    config
  };
  getRandomLinkImageResult(opts, done);
}

function postToTargets(linkResult, done) {
  const id = linkResult.concept.replace(/ /g, '-') + randomId(8);
  const mediaFilename = id + '.jpg';
  const text = dooDooDooDoo();

  postIt(
    {
      id,
      text,
      altText: `${text} (${linkResult.concept})`,
      mediaFilename,
      buffer: linkResult.buffer,
      targets: [
        {
          type: 'noteTaker',
          config: config.noteTaker
        }
      ]
    },
    done
  );
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  } else {
    // Technically, the user wasn't replied to, but good enough.
    // lastTurnRecord.recordTurn(callOutId, new Date(), reportRecording);
  }
}
