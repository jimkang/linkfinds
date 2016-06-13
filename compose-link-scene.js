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
const values = require('lodash.values');
const assetKeysForMapIds = require('./asset-keys-for-map-ids');
const assetsToPreload = values(assetKeysForMapIds);
const PopulateScene = require('./populate-scene');
const range = require('d3-array').range;

const backgroundTable = probable.createTableFromDef({
  '0-19': 0xFFFFFFFF, // 'background-white',
  '20-54': 0X000000FF, // 'background-black',
  '55-89': 0XFEDBABFF, // 'background-overworld'
  '90-99': 0XFEDBAB00 // transparent
});

function ComposeLinkScene(createOpts, createDone) {
  const populateScene = PopulateScene({
    probable: probable
  });

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
      if (error) {
        sceneDone(error);
        return;
      }
      
      const sceneSizeInTiles = determineSceneSizeInTiles(thing);
      const thingPositionPixels = determineThingPositionInPixels(thing, sceneSizeInTiles);
      const linkPositionPixels = [
        (sceneSizeInTiles[0]/2 - 0.5) * tileSize,
        thingPositionPixels[1] + thing.bitmap.height
      ];

      var occupied = tilesOccupiedByImage(
        thingPositionPixels[0], thingPositionPixels[1],
        thing.bitmap.width, thing.bitmap.height
      );
      occupied = occupied.concat(tilesOccupiedByImage(
        linkPositionPixels[0], linkPositionPixels[1],
        tileSize, tileSize
      ));

      const sceneMap = populateScene({
        sceneSize: sceneSizeInTiles,
        occupiedSpots: occupied
      });
      // console.log('sceneMap', sceneMap);

      var imageSpecs = sceneMapToImageSpecs(sceneMap);
      imageSpecs.push({
        cacheId: probable.roll(5) === 0 ? 'link-both-arms-up' : 'link-one-arm-up',
        x: linkPositionPixels[0],
        y: linkPositionPixels[1]
      });
      imageSpecs.push({
        jimpImage: thing,
        x: thingPositionPixels[0],
        y: thingPositionPixels[1]
      });

      var pasteOpts = {
        background: {
          width: sceneSizeInTiles[0] * tileSize,
          height: sceneSizeInTiles[1] * tileSize,
          fill: backgroundTable.roll()
        },
        images: imageSpecs
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

function pixelToTileCoord(pxcoord) {
  return ~~(pxcoord/tileSize);
}

function determineThingPositionInPixels(thing, sceneSizeInTiles) {
  const heightIncludingLink = thing.bitmap.height + tileSize;
  const freeVerticalSpace = sceneSizeInTiles[1] * tileSize - heightIncludingLink;

  return [
    ~~((sceneSizeInTiles[0] * tileSize)/2 - thing.bitmap.width/2),
    pixelToTileCoord(freeVerticalSpace/2)
  ];
}

function tilesOccupiedByImage(pixelX, pixelY, width, height) {
  const tileX = pixelToTileCoord(pixelX);
  const tileY = pixelToTileCoord(pixelY);
  const endTileX = pixelToTileCoord(pixelX + width);
  const endTileY = pixelToTileCoord(pixelY + height);
  var tilesOccupied = [];

  for (var x = tileX; x <= endTileX; ++x) {
    for (var y = tileY; y <= endTileY; ++y) {
      tilesOccupied.push([x, y]);
    }
  }
  return tilesOccupied;
}

function sceneMapToImageSpecs(sceneMap) {
  var imageSpecs = [];
  for (var x = 0; x < sceneMap.length; ++x) {
    for (var y = 0; y < sceneMap[0].length; ++y) {
      var assetKey = assetKeysForMapIds[sceneMap[x][y]];
      if (assetKey) {
        var spec = {
          cacheId: assetKey,
          x: x * tileSize,
          y: y * tileSize
        };
        imageSpecs.push(spec);
      }
    }
  }
  return imageSpecs;
}

module.exports = ComposeLinkScene;
