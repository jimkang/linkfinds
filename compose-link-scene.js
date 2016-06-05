const Jimp = require('jimp');
const async = require('async');
const queue = require('d3-queue').queue;

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
  var assetsForIds = {};

  function passComposeFn(error) {
    if (error) {
      createDone(error);
    }
    else {
      createDone(null, composeLinkScene);
    }
  }

  function loadAsset(id, done) {
    Jimp.read(__dirname + `/static/${id}.png`, saveAsset);

    function saveAsset(error, asset) {
      if (error) {
        done(error);
      }
      else {
        assetsForIds[id] = asset;
        done();
      }
    }
  }

  function composeLinkScene(opts, sceneDone) {
    var thingURL;
    var thing;
    var scene;
    var sceneWidth;
    var sceneHeight;

    if (opts) {
      thingURL = opts.thingURL;
    }

    async.waterfall(
      [
        loadThing,
        createImage,
        addLink,
        addThing,
        sendBuffer
      ],
      sceneDone
    );

    function loadThing(done) {
      Jimp.read(thingURL, done);
    }
  }

  function createImage(thingImage, done) {
    thing = thingImage;

    sceneWidth = thing.bitmap.width + 2 * margin;
    if (sceneWidth < minSceneWidth) {
      sceneWidth = minSceneWidth;
    }

    sceneHeight = thing.bitmap.height + 2 * margin + linkHeight;
    if (sceneHeight < minSceneHeight) {
      sceneHeight = minSceneHeight;
    }

    new Jimp(sceneWidth, sceneHeight, 0XFEDBABFF, done);
  }

  function addLink(theImage, done) {
    scene = theImage;
    scene.composite(
      assetsForIds['link-one-arm-up'],
      ~~(sceneWidth/2) - maxLinkWidth/2,
      sceneHeight - margin - linkHeight,
      done
    );
  }

  function addThing(theImage, done) {
    scene.composite(
      thing,
      margin,
      margin,
      done
    );
  }

  function sendBuffer(thingImage, done) {
    scene.getBuffer(Jimp.MIME_PNG, done);
  }

  ((function loadAssets() {
    const q = queue();
    assetsToPreload.forEach(queueLoad);

    function queueLoad(id) {
      q.defer(loadAsset, id);
    }

    q.awaitAll(passComposeFn);
  })());  
}

module.exports = ComposeLinkScene;
