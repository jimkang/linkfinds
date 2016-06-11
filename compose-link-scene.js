const async = require('async');
const queue = require('d3-queue').queue;
const Jimp = require('jimp');
const PasteBitmaps = require('paste-bitmaps');
const probable = require('probable');
const maxLinkWidth = 56;
const tileSize = 64;
const linkHeight = tileSize;
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
      const sceneSizeInTiles = determineSceneSizeInTiles(thing);
      const thingPositionPixels = determinethingPositionInPixels(thing, sceneSizeInTiles);
      const linkPositionPixels = [
        (sceneSizeInTiles[0]/2 - 0.5) * tileSize,
        thingPositionPixels[1] + thing.bitmap.height
      ];
      console.log('thingPositionPixels[1] ', thingPositionPixels[1], 'getImageTileSize(thing)[1]', getImageTileSize(thing)[1]);

      var pasteOpts = {
        background: {
          width: sceneSizeInTiles[0] * tileSize,
          height: sceneSizeInTiles[1] * tileSize,
          fill: 0XFEDBABFF // TODO: Vary
        },
        images: [
          {
            cacheId: 'link-one-arm-up',
            x: linkPositionPixels[0],
            y: linkPositionPixels[1]
          },
          {
            jimpImage: thing,
            x: thingPositionPixels[0],
            y: thingPositionPixels[1]
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

function determineSceneSizeInTiles(thing) {
  const thingTileSize = getImageTileSize(thing);

  // Average to 16x11.
  var sceneWidth = 4 + probable.roll(13) + probable.roll(13);
  var sceneHeight = 4 + probable.roll(8) + probable.roll(8)

  if (sceneWidth < thingTileSize[0] + 2) {
    sceneWidth = thingTileSize[0] + 2;
  }

  if (sceneHeight < thingTileSize[1] + 2) {
    sceneHeight = thingTileSize[1] + 2;
  }
  return [sceneWidth, sceneHeight];
}

function getImageTileSize(image) {
  return [
    Math.ceil(image.bitmap.width/tileSize),
    Math.ceil(image.bitmap.height/tileSize)
  ];
}

function determinethingPositionInPixels(thing, sceneSizeInTiles) {
  const heightIncludingLink = thing.bitmap.height + tileSize;
  const freeVerticalSpace = sceneSizeInTiles[1] * tileSize - heightIncludingLink;

  return [
    ~~((sceneSizeInTiles[0] * tileSize)/2 - thing.bitmap.width/2),
    ~~(freeVerticalSpace/2)
  ];
}

module.exports = ComposeLinkScene;
