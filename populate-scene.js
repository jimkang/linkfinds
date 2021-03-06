const defaultProbable = require('probable');
const range = require('d3-array').range;
const populateWoodsScene = require('./populate-woods-scene');
const populateCaveScene = require('./populate-cave-scene');
const populateLostWoodsScene = require('./populate-lost-woods-scene');
const poplulateGraveyardScene = require('./populate-graveyard-scene');

const sceneTableDef = {
  '0-24': 'cave',
  '25-49': 'woods',
  '50-64': 'lost-woods',
  '65-69': 'graveyard'
  // '65-66': 'party'
};

const populatorForScene = {
  woods: populateWoodsScene,
  cave: populateCaveScene,
  'lost-woods': populateLostWoodsScene,
  graveyard: poplulateGraveyardScene
};

function PopulateScene(createOpts) {
  var probable;

  if (createOpts) {
    probable = createOpts.probable;
  }

  if (!probable) {
    probable = defaultProbable;
  }

  const sceneTable = probable.createTableFromDef(sceneTableDef);

  return populateScene;

  function populateScene(opts) {
    var sceneSize;
    var occupiedSpots;

    if (opts) {
      sceneSize = opts.sceneSize;
      occupiedSpots = opts.occupiedSpots;
    }

    var sceneMap = range(sceneSize[0]).map(makeColumn);
    markSpots(sceneMap, occupiedSpots, 'x');
    const sceneType = sceneTable.roll();
    // console.log(sceneType);
    populatorForScene[sceneType]({
      probable: probable,
      sceneMap: sceneMap
    });

    // addFlames

    return sceneMap;

    function makeColumn() {
      return range(sceneSize[1]).map(() => '.');
    }
  }
}

function markSpots(sceneMap, spots, mark) {
  spots.forEach(markSpot);
  return sceneMap;

  function markSpot(spot) {
    sceneMap[spot[0]][spot[1]] = mark;
  }
}

module.exports = PopulateScene;
