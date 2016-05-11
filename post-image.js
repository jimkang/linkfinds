var request = require('request');
var async = require('async');
var pick = require('lodash.pick');

// TODO: This could be in its own package.
function postImage(opts, allDone) {
  var twit;
  var dryRun;
  var base64Image;
  var altText;
  var caption;
  var in_reply_to_status_id;

  if (opts) {
    twit = opts.twit;
    dryRun = opts.dryRun;
    base64Image = opts.base64Image;
    altText = opts.altText;
    caption = opts.caption;
    in_reply_to_status_id = opts.in_reply_to_status_id;
  }

  if (base64Image.length < 10) {
    callNextTick(
      allDone, new Error('Received bad base64 image in postImage opts: ' + JSON.stringify(opts))
    );
    return;
  }

  var optSummary = pick(opts, 'altText', 'caption', 'in_reply_to_status_id');
  optSummary.base64Image = postImageOpts.base64Image.substr(0, 30) + '[truncated]';
  console.log('Posting image', optSummary);

  var mediaPostData;

  async.waterfall(
    [
      postMedia,
      postMetadata,
      postTweet
    ],
    allDone
  );

  function postMedia(done) {
    var mediaPostOpts = {
      media_data: base64Image 
    };
    twit.post('media/upload', mediaPostOpts, done);
  }

  function postMetadata(theMediaPostData, response, done) {
    // Save this for other functions in the above scope.
    mediaPostData = theMediaPostData;

    var metaParams = {
      media_id: mediaPostData.media_id_string,
      alt_text: {
        text: altText
      }
    };
    twit.post('media/metadata/create', metaParams, done);
  }

  function postTweet(metaDataPostData,  response, done) {
    var body = {
      status: caption,
      media_ids: [
        mediaPostData.media_id_string
      ]
    };
    if (in_reply_to_status_id) {
      body.in_reply_to_status_id = in_reply_to_status_id;
    }

    if (dryRun) {
      console.log('Would have tweeted: using', JSON.stringify(body, null, '  '));
      callNextTick(done);
    }
    else {
      twit.post('statuses/update', body, done);
    }
  }
}

module.exports = postImage;
