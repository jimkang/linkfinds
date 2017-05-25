var config = require('./config');
// var config = require('./test-config');
var async = require('async');
var getRandomLinkImageResult = require('./get-random-link-image-result');
var ComposeLinkScene = require('./compose-link-scene');
var Tumblrwks = require('tumblrwks');
var tumblr = new Tumblrwks(config.tumblr, config.tumblr.blog);
var dooDooDooDoo = require('./doo-doo-doo-doo');

var source = 'wordnik';

async.waterfall(
  [
    createComposeLinkScene,
    obtainImage,
    postLinkFindingImageToTumblr
  ],
  wrapUp
);

function createComposeLinkScene(done) {
  ComposeLinkScene({}, done);
}

function obtainImage(composeLinkScene, done) {
  var opts = {
    source: source,
    config: config,
    composeLinkScene: composeLinkScene
  };
  getRandomLinkImageResult(opts, done);
}

function postLinkFindingImageToTumblr(linkResult, done) {
  var postImageOpts = {
    type: 'photo',
    source: 'data64',
    data64: linkResult.base64Image,
    caption: dooDooDooDoo(),
    tags: 'zelda, link, ' + linkResult.concept.replace(/ /g, '')
  };

  tumblr.post('/post', postImageOpts, avoidLongWarningCallback);

  function avoidLongWarningCallback(error, result) {
    done(error, result);
  }
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
}
