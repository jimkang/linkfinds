var callNextTick = require("call-next-tick");
var Jimp = require("jimp");
var waterfall = require("async-waterfall");
var queue = require("d3-queue").queue;

function PasteBitmaps(createOpts, constructDone) {
  var assetsForIds = {};
  var pathsToFilesToCache;

  if (createOpts) {
    pathsToFilesToCache = createOpts.pathsToFilesToCache;
  }

  if (pathsToFilesToCache) {
    cacheBitmaps(pathsToFilesToCache, passPasteBitmaps);
  } else {
    passPasteBitmaps();
  }

  function passPasteBitmaps(error) {
    if (error) {
      constructDone(error);
    } else {
      constructDone(error, pasteBitmaps);
    }
  }

  function cacheBitmaps(pathsForIds, done) {
    var q = queue();

    for (var id in pathsForIds) {
      q.defer(loadAsset, id, pathsForIds[id]);
    }

    q.awaitAll(done);
  }

  function loadAsset(id, path, done) {
    Jimp.read(path, saveAsset);

    function saveAsset(error, asset) {
      if (error) {
        done(error);
      } else {
        assetsForIds[id] = asset;
        done();
      }
    }
  }

  function pasteBitmaps(opts, pasteDone) {
    var background;
    var images;

    if (opts) {
      background = opts.background;
      images = opts.images;
    }

    waterfall([createScene, addImages, sendBuffer], pasteDone);

    function createScene(done) {
      new Jimp(background.width, background.height, background.fill, done);
    }

    function addImages(scene, done) {
      var q = queue(1);
      images.forEach(queuePaste);
      q.awaitAll(passScene);

      function queuePaste(image) {
        q.defer(addLayer, scene, image);
      }

      function passScene(error) {
        if (error) {
          done(error);
        } else {
          done(null, scene);
        }
      }
    }

    function addLayer(scene, imageSpec, done) {
      if (imageSpec.cacheId) {
        scene.composite(
          assetsForIds[imageSpec.cacheId],
          imageSpec.x,
          imageSpec.y,
          done
        );
      } else if (imageSpec.filePath || imageSpec.url) {
        var resource = imageSpec.filePath;
        if (!resource) {
          resource = imageSpec.url;
        }
        Jimp.read(resource, addLoadedImage);
      } else if (imageSpec.jimpImage) {
        scene.composite(imageSpec.jimpImage, imageSpec.x, imageSpec.y, done);
      } else {
        done(
          new Error(
            "Invalid image spec. Needs either a cacheId, filePath, or url."
          )
        );
      }

      function addLoadedImage(error, loadedImage) {
        if (error) {
          done(error);
        } else {
          scene.composite(loadedImage, imageSpec.x, imageSpec.y, done);
        }
      }
    }

    function sendBuffer(scene, done) {
      scene.getBuffer(Jimp.MIME_PNG, done);
    }
  }
}

module.exports = PasteBitmaps;
