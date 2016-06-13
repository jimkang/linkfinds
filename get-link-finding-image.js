function GetLinkFindingImage(opts) {
  var config;
  var composeLinkScene;

  if (opts) {
    config = opts.config;
    composeLinkScene = opts.composeLinkScene;
  }

  return getLinkFindingImage;

  function getLinkFindingImage(imageConceptResult, done) {
    var base64Image = '';

    var composeOpts = {
      thingURL: imageConceptResult.imgurl
    };
    composeLinkScene(composeOpts, passImageAndConcept);

    function passImageAndConcept(error, image) {
      if (error) {
        done(error);
        return;
      }

      var result = {
        base64Image: image.toString('base64'),
        concept: imageConceptResult.concept
      };

      done(null, result);
    }
  }
}

module.exports = GetLinkFindingImage;
