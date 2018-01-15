/* global process */

var config = require('./config');
// var config = require('./test-config');

var Twit = require('twit');
var async = require('async');
var postImage = require('./post-image');
var getRandomLinkImageResult = require('./get-random-link-image-result');
var dooDooDooDoo = require('./doo-doo-doo-doo');
var ComposeLinkScene = require('./compose-link-scene');
var fs = require('fs');
var queue = require('d3-queue').queue;
var randomId = require('idmaker').randomId;
var StaticWebArchiveOnGit = require('static-web-archive-on-git');

var staticWebStream = StaticWebArchiveOnGit({
  config: config.github,
  title: '@linkfinds archives',
  footerScript: `<script type="text/javascript">
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-49491163-1', 'jimkang.com');
  ga('send', 'pageview');
</script>`,
  maxEntriesPerPage: 20
});

var source = 'wordnik';
var dryRun = false;

if (process.argv.length > 2) {
  if (process.argv[2].toLowerCase() === '--trending-source') {
    source = 'trending';
  }

  dryRun = process.argv.indexOf('--dry') !== -1;
}

var twit = new Twit(config.twitter);

async.waterfall([createComposeLinkScene, obtainImage, postToTargets], wrapUp);

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

function postToTargets(linkResult, done) {
  var q = queue();
  q.defer(postLinkFindingImage, linkResult);
  q.defer(postToArchive, linkResult);
  q.await(done);
}

function postLinkFindingImage(linkResult, done) {
  var postImageOpts = {
    twit,
    dryRun,
    base64Image: linkResult.base64Image,
    altText: linkResult.concept,
    caption: dooDooDooDoo()
  };

  if (source === 'trending') {
    postImageOpts.caption += ' #' + linkResult.altText.replace(/ /g, '');
  }

  if (dryRun) {
    const filename =
      'would-have-posted-' +
      new Date().toISOString().replace(/:/g, '-') +
      '.png';
    console.log('Writing out', filename);
    fs.writeFileSync(filename, postImageOpts.base64Image, {
      encoding: 'base64'
    });
    process.exit();
  } else {
    postImage(postImageOpts, done);
  }
}

function postToArchive(linkResult, done) {
  var id = linkResult.concept.replace(/ /g, '-') + randomId(8);
  staticWebStream.write({
    id,
    date: new Date().toISOString(),
    mediaFilename: id + '.png',
    caption: `${dooDooDooDoo()} (${linkResult.concept})`,
    buffer: linkResult.buffer
  });
  staticWebStream.end(done);
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
