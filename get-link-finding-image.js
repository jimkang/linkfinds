function GetLinkFindingImage(opts) {
  var composeLinkScene;

  if (opts) {
    composeLinkScene = opts.composeLinkScene;
  }

  return getLinkFindingImage;

  function getLinkFindingImage(imageConceptResult, done) {
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
        buffer: image,
        base64Image: image.toString('base64'),
        concept: imageConceptResult.concept
      };

      done(null, result);
    }
  }
}

module.exports = GetLinkFindingImage;
