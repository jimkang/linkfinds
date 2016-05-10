var webshot = require('webshot');

var baseLinkRenderURL = 'http://jimkang.com/link-finding/#/thing/';
// var baseLinkRenderURL = 'http://localhost:9966/#/thing/';
var maxLinkWidth = 56;
var linkHeight = 64;
var linkMarginLeft = 32;

function getLinkFindingImage(imageConceptResult, done) {
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
    renderDelay: 1000
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
    done(null, result);
  }

  function passError(error) {
    done(error);
  }
}

module.exports = getLinkFindingImage;
