const assetKeysForMapIds = require('./asset-keys-for-map-ids');

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

  addEntities(sceneMap, treesTableDef, () => probable.roll(8) === 0);

  if (probable.roll(3) === 0) {
    addEntities(sceneMap, guysTableDef, () => probable.roll(8) === 0);
  }

  return sceneMap;

  function addEntities(map, entityTableDef, entityAddRoll) {
    const table = probable.createTableFromDef(entityTableDef);
    for (var x = 0; x < map.length; ++x) {
      for (var y = 0; y < map[x].length; ++y) {
        if (map[x][y] === '.' && entityAddRoll()) {
          map[x][y] = table.roll();
        }      
      }
    }
  }

}

module.exports = populateWoodsScene;
