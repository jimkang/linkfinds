var request = require('request');
var async = require('async');

// TODO: This could be in its own package.
function postImage(opts, allDone) {
  var twit;
  var dryRun;
  var base64Image;
  var altText;
  var caption;

  if (opts) {
    twit = opts.twit;
    dryRun = opts.dryRun;
    base64Image = opts.base64Image;
    altText = opts.altText;
    caption = opts.caption;
  }

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
    debugger;
    if (dryRun) {
      console.log('Would have tweeted: using', opts);
      callNextTick(done);
    }
    else {
      var body = {
        status: caption,
        media_ids: [
          mediaPostData.media_id_string
        ]
      };
      twit.post('statuses/update', body, done);
    }
  }
}

module.exports = postImage;
