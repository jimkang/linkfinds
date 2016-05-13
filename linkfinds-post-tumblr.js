var config = require('./config');
// var config = require('./test-config');
var async = require('async');
var postImage = require('./post-image');
var getRandomLinkImageResult = require('./get-random-link-image-result');

var Tumblrwks = require('tumblrwks');
var tumblr = new Tumblrwks(config.tumblr, config.tumblr.blog);

var source = 'wordnik';

async.waterfall(
  [
    obtainImage,
    postLinkFindingImageToTumblr
  ],
  wrapUp
);

function obtainImage(done) {
  var opts = {
    source: source,
    config: config
  };
  getRandomLinkImageResult(opts, done);
}

function postLinkFindingImageToTumblr(linkResult, done) {
  var postImageOpts = {
    type: 'photo',
    source: 'data64',
    data64: linkResult.base64Image,
    caption: '♪ DOO DOO DOO DOO! ♪'
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
