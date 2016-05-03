var webshot = require('webshot');

var baseLinkRenderURL = 'http://jimkang.com/link-finding/#/thing/';
// var baseLinkRenderURL = 'http://localhost:9966/#/thing/';

function getLinkFindingImage(imageConceptResult, done) {
  var url = baseLinkRenderURL + encodeURIComponent(imageConceptResult.imgurl);
  url += '/desc/' + imageConceptResult.concept;
  var base64Image = '';

  var webshotOpts = {
    screenSize: {
      width: 800,
      height: 800
    },
    shotSize: {
      width: 'all',
      height: 'all'
    },
    streamType: 'png'
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
