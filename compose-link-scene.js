/* global __dirname */

const Jimp = require('jimp');
const PasteBitmaps = require('paste-bitmaps');
const createProbable = require('probable').createProbable;
const tileSize = 64;
const values = require('lodash.values');
const assetKeysForMapIds = require('./asset-keys-for-map-ids');
const assetsToPreload = values(assetKeysForMapIds);
const PopulateScene = require('./populate-scene');
const palette = require('get-rgba-palette');

function ComposeLinkScene(createOpts, createDone) {
  var random;

  if (createOpts) {
    random = createOpts.random;
  }

  var probable = createProbable();
  if (random) {
    probable = createProbable({
      random: random
    });
  }

  var linkTable = probable.createTableFromSizes([
    [50, 'link-one-arm-up'],
    [20, 'link-both-arms-up'],
    [16, 'link-one-arm-up-blue-ring'],
    [4, 'link-both-arms-up-blue-ring'],
    [8, 'link-one-arm-up-red-ring'],
    [2, 'link-both-arms-up-red-ring']
  ]);

  // TODO: Background should be part of the scene.
  const backgroundTable = probable.createTableFromDef({
    '0-19': 0xffffffff, // 'background-white',
    '20-54': 0x000000ff, // 'background-black',
    '55-89': 0xfedbabff, // 'background-overworld'
    '90-99': 0xfedbab00, // transparent,
    '100-109': 0x757575ff // graveyard
  });
  const backgroundTableNoBlack = probable.createTableFromDef({
    '0-34': 0xffffffff, // 'background-white',
    '35-89': 0xfedbabff, // 'background-overworld'
    '90-99': 0xfedbab00, // transparent,
    '100-109': 0x757575ff // graveyard
  });

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
    } else {
      pasteBitmaps = thePasteBitmapsFn;
      createDone(null, composeLinkScene);
    }
  }

  function composeLinkScene(opts, sceneDone) {
    var thingURL;

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
      const thingPositionPixels = determineThingPositionInPixels(
        thing,
        sceneSizeInTiles
      );
      const linkPositionPixels = [
        (sceneSizeInTiles[0] / 2 - 0.5) * tileSize,
        thingPositionPixels[1] + thing.bitmap.height
      ];

      var occupied = tilesOccupiedByImage(
        thingPositionPixels[0],
        thingPositionPixels[1],
        thing.bitmap.width,
        thing.bitmap.height
      );
      var tilesOccupiedByLink = tilesOccupiedByImage(
        linkPositionPixels[0],
        linkPositionPixels[1],
        tileSize,
        tileSize
      );
      occupied = occupied.concat(tilesOccupiedByLink);

      var lowestLinkRow =
        tilesOccupiedByLink[tilesOccupiedByLink.length - 1][1];

      // We always want there to be one row below Link so that he does not get cut off.
      if (lowestLinkRow >= sceneSizeInTiles[1]) {
        sceneSizeInTiles[1] = lowestLinkRow + 1;
      }

      const sceneMap = populateScene({
        sceneSize: sceneSizeInTiles,
        occupiedSpots: occupied
      });
      // console.log('sceneMap', sceneMap);

      var imageSpecs = sceneMapToImageSpecs(sceneMap);
      imageSpecs.push({
        cacheId: linkTable.roll(),
        // cacheId: probable.roll(5) === 0 ? 'link-both-arms-up-xmas' : 'link-one-arm-up-xmas',
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

      if (pasteOpts.background.fill === 0x000000ff) {
        var colors = palette(thing.bitmap.data, 1, 1);
        if (isCloseToBlack(colors[0])) {
          pasteOpts.background.fill = backgroundTableNoBlack.roll();
        }
      }

      pasteBitmaps(pasteOpts, sceneDone);
    }
  }

  function determineSceneSizeInTiles(thing) {
    const thingTileSize = getImageTileSize(thing);

    // Average to 16x11.
    var sceneWidth = 4 + probable.roll(13) + probable.roll(13);
    var sceneHeight = 4 + probable.roll(8) + probable.roll(8);

    if (sceneWidth < thingTileSize[0] + 2) {
      sceneWidth = thingTileSize[0] + 2;
    }

    if (sceneHeight > 2 * thingTileSize[1]) {
      sceneHeight = ~~(sceneHeight / 2);
    } else if (sceneHeight < thingTileSize[1] + 2) {
      sceneHeight = thingTileSize[1] + 2;
    }
    return [sceneWidth, sceneHeight];
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

function getImageTileSize(image) {
  return [
    Math.ceil(image.bitmap.width / tileSize),
    Math.ceil(image.bitmap.height / tileSize)
  ];
}

function pixelToTileCoord(pxcoord) {
  return ~~(pxcoord / tileSize);
}

function determineThingPositionInPixels(thing, sceneSizeInTiles) {
  const heightIncludingLink = thing.bitmap.height + tileSize;
  const freeVerticalSpace =
    sceneSizeInTiles[1] * tileSize - heightIncludingLink;

  return [
    ~~(sceneSizeInTiles[0] * tileSize / 2 - thing.bitmap.width / 2),
    tileSize * pixelToTileCoord(freeVerticalSpace / 2)
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

function isCloseToBlack(rgb) {
  return rgb[0] < 25 && rgb[1] < 25 && rgb[2] < 25;
}

module.exports = ComposeLinkScene;
