var webshot = require('webshot');
var randomId = require('idmaker').randomId;

var baseLinkRenderURL = 'http://jimkang.com/link-finding/#/thing/';
// var baseLinkRenderURL = 'http://localhost:9966/#/thing/';
var maxLinkWidth = 56;
var linkHeight = 64;
var linkMarginLeft = 32;

var maxSimultaneousWebshots = 1;
var webshotsInProgress = 0;

var webshotQueue = [];

function queueWebshot(imageConceptResult, callback) {
  var queueItem = {
    id: randomId(4),
    imageConceptResult: imageConceptResult,
    callback: callback
  };
  webshotQueue.push(queueItem);
}

function runNextWebshotInQueue() {
  if (webshotQueue.length < 1) {
    console.log('No more webshots in queue!');
  }
  else if (webshotsInProgress < maxSimultaneousWebshots) {
    console.log('Pulling webshot off of queue.');
    var queueItem = webshotQueue.shift();
    runWebshot(queueItem.id, queueItem.imageConceptResult, queueItem.callback);
  }
  else {
    console.log(
      'Not pulling off of queue.', 
      webshotsInProgress, 'webshots in progress.',
      maxSimultaneousWebshots, 'max.'
    );
  }
}

function getLinkFindingImage(imageConceptResult, done) {
  queueWebshot(imageConceptResult, done);
  runNextWebshotInQueue();
}

function runWebshot(queueId, imageConceptResult, done) {
  webshotsInProgress += 1;
  console.log('running webshot for', queueId, imageConceptResult);
  console.log('webshotsInProgress', webshotsInProgress);

  var url = baseLinkRenderURL + encodeURIComponent(imageConceptResult.imgurl);
  url += '/desc/' + imageConceptResult.concept;
  url += '/width/' + imageConceptResult.width + '/height/' + imageConceptResult.height;
  // console.log('url', url);

  var base64Image = '';
  var width = imageConceptResult.width;
  if (width < maxLinkWidth + linkMarginLeft) {
    width = maxLinkWidth + linkMarginLeft;
  }
  var height = imageConceptResult.height + linkHeight;

  var webshotOpts = {
    screenSize: {
      width: width,
      height: height
    },
    shotSize: {
      width: width,
      height: height
    },
    streamType: 'png',
    takeShotOnCallback: true,
    errorIfStatusIsNot200: true,
    errorIfJSException: true
  };

  var renderStream =  webshot(url, webshotOpts);
  renderStream.on('data', saveToBase64Image);
  renderStream.on('end', passImageAndConcept);
  renderStream.on('error', passError);

  function saveToBase64Image(data) {
    base64Image += data.toString('base64');
  }

  function passImageAndConcept() {
    var result = {
      base64Image: base64Image,
      concept: imageConceptResult.concept
    };

    webshotsInProgress -= 1;

    console.log('Completed webshot for', queueId, imageConceptResult);
    console.log('webshotsInProgress', webshotsInProgress);

    done(null, result);
    runNextWebshotInQueue();
  }

  function passError(error) {
    done(error);
  }
}

module.exports = getLinkFindingImage;
