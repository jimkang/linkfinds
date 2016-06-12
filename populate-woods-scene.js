const assetKeysForMapIds = require('./asset-keys-for-map-ids');

const treesTableDef = {
  '0-89': 't', // green-tree
  '90-98': 'e', // autumn-tree
  '99': 'r' // grave-tree
};

function populateWoodsScene(opts) {
  var probable;
  var sceneMap;

  if (opts) {
    probable = opts.probable;
    sceneMap = opts.sceneMap;
  }

  addTrees(sceneMap);

  return sceneMap;

  function addTrees(map) {
    const treeTable = probable.createTableFromDef(treesTableDef);
    for (var x = 0; x < map.length; ++x) {
      for (var y = 0; y < map[x].length; ++y) {
        if (probable.roll(8) === 0 && map[x][y] === '.') {
          map[x][y] = treeTable.roll();
        }      
      }
    }
  }
}

module.exports = populateWoodsScene;
