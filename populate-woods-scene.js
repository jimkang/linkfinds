const addEntitiesToMap = require('./add-entities-to-map');

const treesTableDef = {
  '0-89': 't', // green-tree
  '90-98': 'e', // autumn-tree
  '99-99': 'r', // grave-tree
  '100-102': '¡' // 'armos-statue'
};

const guysTableDef = {
  '0-29': 'M', // Moblin
  '30-54': 'o', // Octorok
  '55-69': 's', // Tektite
  '70-98': 'F', // Fairy
  '99-99': '$', // Merchant
  '100-100': '¢', // goriya'
  '101-109': '¥', // moblin-blue'
  '110-124': '¦', // octorok-blue'
  '125-139': 'ª', // tektite-blue'
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
