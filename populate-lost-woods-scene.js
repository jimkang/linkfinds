const addEntitiesToMap = require('./add-entities-to-map');

const fixturesTableDef = {
  '0-79': 'e', // autumn-tree
  '80-94': 't', // green-tree
  '95-99': 'r', // grave-tree
  '100-104': 'g', // grave
  '105-108': '¡' // 'armos-statue'
};

const guysTableDef = {
  '0-69': 'M', // Moblin
  '70-98': 'F', // Fairy
  '99-99': 'm', // old man
  '100-109': 'G', // Ghini
  '110-119': '¢', // goriya'
  '120-149': '¥', // moblin-blue'
  '150-159': '¦', // octorok-blue'
  '160-169': 'ª', // tektite-blue'
};

function populateLostWoodsScene(opts) {
  var probable;
  var sceneMap;

  if (opts) {
    probable = opts.probable;
    sceneMap = opts.sceneMap;
  }

  addEntitiesToMap({
    map: sceneMap,
    probable: probable,
    entityTableDef: fixturesTableDef,
    entityAddRoll: () => probable.roll(6) === 0
  });

  if (probable.roll(3) === 0) {
    addEntitiesToMap({
      map: sceneMap,
      probable: probable,
      entityTableDef: guysTableDef,
      entityAddRoll: () => probable.roll(25) === 0
    });
  }

  return sceneMap;
}

module.exports = populateLostWoodsScene;
