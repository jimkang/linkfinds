var request = require('request');
var async = require('async');
var pick = require('lodash.pick');
var callNextTick = require('call-next-tick');

const byteSizeEstimate = 4 * 1024 * 1024;

// TODO: This could be in its own package.
function postImage(opts, allDone) {
  var twit;
  var dryRun;
  var imageStream;
  var altText;
  var caption;
  var in_reply_to_status_id;

  if (opts) {
    twit = opts.twit;
    dryRun = opts.dryRun;
    imageStream = opts.imageStream;
    altText = opts.altText;
    caption = opts.caption;
    in_reply_to_status_id = opts.in_reply_to_status_id;
  }

  // if (base64Image.length < 10) {
  //   callNextTick(
  //     allDone, new Error('Received bad base64 image in postImage opts: ' + JSON.stringify(opts))
  //   );
  //   return;
  // }

  var optSummary = pick(opts, 'altText', 'caption', 'in_reply_to_status_id');
  // optSummary.base64Image = base64Image.substr(0, 100) + '[truncated]';
  console.log('Posting image for', altText, JSON.stringify(optSummary));

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
    // Based on twit's FileUploader.
    // imageStream.on('response', startUploading);

    // function startUploading(response) {
      var mediaInitOpts =  {
        'command': 'INIT',
        'media_type': 'image/png',
        'total_bytes': byteSizeEstimate
      };
      debugger;
      twit.post('media/upload', mediaInitOpts, startStreaming);
    // }

    function startStreaming(error, initBody, initResponse) {
      debugger;
      var mediaId;
      var chunkCount = 0;
      var imageStreamEnded = false;
      var uploadingRightNow = false;

      if (error) {
        done(error);
      }
      else {
        mediaId = initBody.media_id_string;
        imageStream.on('error', done);
        imageStream.on('end', onImageStreamEnd);
        imageStream.on('data', uploadChunk)
      }    

      function onImageStreamEnd() {
        imageStreamEnded = true;
        if (uploadIsComplete()) {
          finalizeUpload();
        }
      }

      function uploadIsComplete() {
        debugger;
        return !uploadingRightNow && imageStreamEnded;
      }

      function uploadChunk(chunk) {
        debugger;
        imageStream.pause();
        uploadingRightNow = true;
        const mediaChunkOpts = {
          command: 'APPEND',
          media_id: mediaId,
          segment_index: chunkCount,
          media: chunk.toString('utf8')
        };
        twit.post('media/upload', mediaChunkOpts, takeStockOfUpload);
      }

      function takeStockOfUpload(error, uploadBody, uploadResponse) {
        debugger;
        uploadingRightNow = false;

        if (error) {
          done(error);
        }
        else {
          if (uploadIsComplete()) {
            finalizeUpload();
          }
          else {
            chunkCount += 1;
            imageStream.resume();
          }
        }
      }
    
      function finalizeUpload() {
        const mediaFinalizeOpts = {
          command: 'FINALIZE',
          media_id: mediaId
        };
        twit.post('media/upload', mediaFinalizeOpts, done);
      }
    }
  }

  function postMetadata(theMediaPostData, response, done) {
    debugger;
    console.log('Posted media for', altText, JSON.stringify(theMediaPostData));

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

  // https://dev.twitter.com/rest/reference/post/media/metadata/create
  // metaDataPostData will be empty if the metadata post was sucessful!
  function postTweet(metaDataPostData, response, done) {
    console.log('Successfully posted metadata. Now posting tweet for', altText);

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
