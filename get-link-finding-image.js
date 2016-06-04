const request = require('request');
const baseLinkRenderURL = 'http://jimkang.com/link-finding/#/thing/';
// var baseLinkRenderURL = 'http://localhost:9966/#/thing/';
const maxLinkWidth = 56;
const linkHeight = 64;
const linkMarginLeft = 32;

function GetLinkFindingImage(opts) {
  var config;

  if (opts) {
    config = opts.config;
  }

  const serverBaseURL = `http://${config.webPhotoBooth.serverDomain}:${config.webPhotoBooth.port}/shoot/`;

  return getLinkFindingImage;

  function getLinkFindingImage(imageConceptResult, done) {
    var linkFindingURL = getLinkFindingURL(imageConceptResult);
    var base64Image = '';

    var reqOpts = {
      method: 'GET',
      url: getPhotoBoothURL(imageConceptResult, linkFindingURL)
    };
    debugger;
    var reqStream = request(reqOpts);
  
    reqStream.on('error', passError);
    reqStream.on('end', passImageAndConcept);
    reqStream.on('data', saveToBase64Image);

    function saveToBase64Image(data) {
      base64Image += data.toString('base64');
    }

    function passImageAndConcept() {
      debugger;

      var result = {
        base64Image: base64Image,
        concept: imageConceptResult.concept
      };

      done(null, result);
    }

    function passError(error) {
      // The stream will not emit the end event at this point.
      done(error);
    }
  }

  function getPhotoBoothURL(imageConceptResult, linkFindingURL) {
    var photoBoothURL = `${serverBaseURL}${encodeURIComponent(linkFindingURL)}`;
    if (imageConceptResult.width) {
      photoBoothURL += `?width=${imageConceptResult.width}`;
    }
    if (imageConceptResult.width && imageConceptResult.height) {
      photoBoothURL += `&`;
    }
    if (imageConceptResult.height) {
      photoBoothURL += `height${imageConceptResult.height}`;
    }
    return photoBoothURL;  
  }  
}

function getLinkFindingURL(imageConceptResult) {
  linkFindingURL = baseLinkRenderURL;
  linkFindingURL += encodeURIComponent(imageConceptResult.imgurl);
  linkFindingURL += '/desc/' + imageConceptResult.concept;

  if (imageConceptResult.width) {
    linkFindingURL += '/width/' + imageConceptResult.width;
  }
  if (imageConceptResult.height) {
    linkFindingURL += '/height/' + imageConceptResult.height;
  }
  return linkFindingURL;
}

module.exports = GetLinkFindingImage;
