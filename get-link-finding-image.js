const request = require('request');
const callNextTick = require('call-next-tick');

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

    // TODO: Maybe further queuing to prevent there from being too many open requests?

    var reqOpts = {
      method: 'GET',
      url: getPhotoBoothURL(imageConceptResult, linkFindingURL)
    };

    var result = {
      imageStream: request(reqOpts),
      concept: imageConceptResult.concept
    };

    callNextTick(done, null, result);
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
