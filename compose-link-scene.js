const async = require('async');
const queue = require('d3-queue').queue;
const Jimp = require('jimp');
const PasteBitmaps = require('paste-bitmaps');

const maxLinkWidth = 56;
const linkHeight = 64;
const margin = 32;
const minSceneWidth = maxLinkWidth + 2 * margin;
const minSceneHeight = linkHeight + 2 * margin;

const assetsToPreload = [
  'autumn-tree',
  'fire',
  'grave',
  'link-one-arm-up',
  'moblin',
  'oldwoman',
  'fairy',
  'grave-tree',
  'green-tree',
  'link-both-arms-up',
  'merchant',
  'oldman'
];

function ComposeLinkScene(createOpts, createDone) {
  var pasteBitmaps;  
  var pasteConfig = {
    pathsToFilesToCache: getPathsForCacheIdsMap(assetsToPreload)
  };
  PasteBitmaps(pasteConfig, passComposeFn);

  function passComposeFn(error, thePasteBitmapsFn) {
    if (error) {
      createDone(error);
    }
    else {
      pasteBitmaps = thePasteBitmapsFn;
      createDone(null, composeLinkScene);
    }
  }

  function composeLinkScene(opts, sceneDone) {
    var thingURL;
    var scene;

    if (opts) {
      thingURL = opts.thingURL;
    }

    Jimp.read(thingURL, makeSceneWithThing);

    function makeSceneWithThing(error, thing) {
      var sceneWidth = thing.bitmap.width + 2 * margin;
      if (sceneWidth < minSceneWidth) {
        sceneWidth = minSceneWidth;
      }

      var sceneHeight = thing.bitmap.height + 2 * margin + linkHeight;
      if (sceneHeight < minSceneHeight) {
        sceneHeight = minSceneHeight;
      }

      var pasteOpts = {
        background: {
          width: sceneWidth,
          height: sceneHeight,
          fill: 0XFEDBABFF // TODO: Vary
        },
        images: [
          {
            cacheId: 'link-one-arm-up',
            x: ~~(sceneWidth/2) - maxLinkWidth/2,
            y: sceneHeight - margin - linkHeight
          },
          {
            jimpImage: thing,
            x: margin,
            y: margin
          }
        ]
      };

      pasteBitmaps(pasteOpts, sceneDone);
    }
  }
}

function getPathsForCacheIdsMap(ids) {
  var map = {};
  ids.forEach(addToMap);
  return map;

  function addToMap(id) {
    map[id] = __dirname + `/static/${id}.png`;
  }
}

module.exports = ComposeLinkScene;
