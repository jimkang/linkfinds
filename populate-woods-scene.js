const addEntitiesToMap = require('./add-entities-to-map');

const treesTableDef = {
  '0-89': 't', // green-tree
  '90-98': 'e', // autumn-tree
  '99': 'r' // grave-tree
};

const guysTableDef = {
  '0-69': 'M', // Moblin
  '70-98': 'F', // Fairy
  '99': '$' // Merchant
};

function populateWoodsScene(opts) {
  var probable;
  var sceneMap;

  if (opts) {
    probable = opts.probable;
    sceneMap = opts.sceneMap;
  }

  addEntitiesToMap({
    map: sceneMap,
    probable: probable,
    entityTableDef: treesTableDef,
    entityAddRoll: () => probable.roll(20) === 0
  });

  if (probable.roll(3) === 0) {
    addEntitiesToMap({
      map: sceneMap,
      probable: probable,
      entityTableDef: guysTableDef,
      entityAddRoll: () => probable.roll(20) === 0
    });
  }

  return sceneMap;
}

module.exports = populateWoodsScene;
