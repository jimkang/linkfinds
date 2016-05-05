#!/usr/bin/env node

var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var behavior = require('./behavior');
var shouldReplyToTweet = require('./should-reply-to-tweet');
var level = require('level');
var Sublevel = require('level-sublevel');
var probable = require('probable');
var getImagesFromTweet = require('get-images-from-tweet');
var pathExists = require('object-path-exists');
var postImage = require('./post-image');
var getLinkFindingImage = require('./get-link-finding-image');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var db = Sublevel(level(__dirname + '/data/linkfinds-responses.db'));
var lastReplyDates = db.sublevel('last-reply-dates');

var username = behavior.twitterUsername;

var twit = new Twit(config.twitter);
var streamOpts = {
  replies: 'all'
};
var stream = twit.stream('user', streamOpts);

stream.on('tweet', respondToTweet);
stream.on('error', logError);

function respondToTweet(incomingTweet) {
  async.waterfall(
    [
      checkIfWeShouldReply,
      getImage,
      postLinkFindingImageReply,
      recordThatReplyHappened
    ],
    wrapUp
  );

  function checkIfWeShouldReply(done) {
    var opts = {
      tweet: incomingTweet,
      lastReplyDates: lastReplyDates
    };
    shouldReplyToTweet(opts, done);
  }  

  function getImage(done) {
    var photo;
    if (pathExists(incomingTweet, ['entities', 'media'])) {
      var media = incomingTweet.entities.media;
      if (media.length > 0) {
        var photos =  media.filter(isPhoto);
        photo = probable.pickFromArray(photos);
      }
    }

    if (photo) {
      var imageConcept = {
        imgurl: photo.media_url,
      };

      if (photo.sizes && 'medium' in photo.sizes) {
        imageConcept.width = photo.sizes.medium.w;
        imageConcept.height = photo.sizes.medium.h;
      }

      imageConcept.concept = 'image'; // TODO: Get real alt text, if available.
      getLinkFindingImage(imageConcept, done);
    }
    else {
      callNextTick(done, new Error('Not implemented.'));
    }
  }

  function postLinkFindingImageReply(linkResult, done) {
    var postImageOpts = {
      twit: twit,
      dryRun: dryRun,
      base64Image: linkResult.base64Image,
      altText: linkResult.concept,
      caption: '@' + incomingTweet.user.screen_name + ' ♪ DOO DOO DOO! ♪',
      in_reply_to_status_id: incomingTweet.id_str
    };

    postImage(postImageOpts, done);
  }

  function recordThatReplyHappened(tweetData, response, done) {
    console.log('Put:', incomingTweet.user.id_str);

    lastReplyDates.put(incomingTweet.user.id_str, tweetData.created_at, done);
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

function logError(error) {
  console.log(error);
}

function isPhoto(medium) {
  return medium.type === 'photo';
}
