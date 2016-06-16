const addEntitiesToMap = require('./add-entities-to-map');

const extraFixturesTableDef = {
  '0-9': 'g', // grave
  '10-99': 'r', // grave-tree
};

const guysTableDef = {
  '0-69': 'G', // Ghini
  '70-98': 'F', // Fairy
  '99-99': 'm', // old man
};

function populateGraveyardScene(opts) {
  var probable;
  var sceneMap;

  if (opts) {
    probable = opts.probable;
    sceneMap = opts.sceneMap;
  }

  const extraFixturesTable = probable.createTableFromDef(extraFixturesTableDef);

  // Rows of graves
  for (var x = 1; x < sceneMap.length; x += 3) {
    for (var y = 1; y < sceneMap[x].length; y += 3) {
      if (sceneMap[x][y] === '.') {
        sceneMap[x][y] = probable.roll(20) === 0 ? extraFixturesTable.roll() : 'g';
      }      
    }
  }

  addEntitiesToMap({
    map: sceneMap,
    probable: probable,
    entityTableDef: extraFixturesTableDef,
    entityAddRoll: () => probable.roll(6) === 0
  });

  if (probable.roll(2) === 0) {
    addEntitiesToMap({
      map: sceneMap,
      probable: probable,
      entityTableDef: guysTableDef,
      entityAddRoll: () => probable.roll(25) === 0
    });
  }

  return sceneMap;
}

module.exports = populateGraveyardScene;
