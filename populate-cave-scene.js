const addEntitiesToMap = require('./add-entities-to-map');

const furnitureTableDef = {
  '0-89': 'f', // fire
  '90-91': 'g' // grave
};

const guysTableDef = {
  '0-39': 'm', // Old Man
  '40-79': 'w', // Old Woman
  '80-119': '$', // Merchant
  '120-129': 'M', // Moblin
  '130-131': 'F', // Fairy
};

function populateCaveScene(opts) {
  var probable;
  var sceneMap;

  if (opts) {
    probable = opts.probable;
    sceneMap = opts.sceneMap;
  }

  if (sceneMap[0].length > 0 && sceneMap.length > 2 && probable.roll(3) > 0) {
    const furnitureTable = probable.createTableFromDef(furnitureTableDef);

    var fixturePairY = sceneMap[0].length - 2;
    if (fixturePairY < 0) {
      fixturePairY = 0;
    }
    const leftFixturePos = [~~(sceneMap.length/4), fixturePairY];
    const rightFixturePos = [Math.ceil(3 * sceneMap.length/4), fixturePairY];
    const fixtureKey = furnitureTable.roll();
    if (sceneMap[leftFixturePos[0]][leftFixturePos[1]] === '.') {
      sceneMap[leftFixturePos[0]][leftFixturePos[1]] = fixtureKey;
    }
    if (sceneMap[rightFixturePos[0]][rightFixturePos[1]] === '.') {
      sceneMap[rightFixturePos[0]][rightFixturePos[1]] = fixtureKey;
    }

    if (probable.roll(20) === 0) {
      addEntitiesToMap({
        map: sceneMap,
        probable: probable,
        entityTableDef: furnitureTableDef,
        entityAddRoll: () => probable.roll(20) === 0
      });
    }
  }

  if (probable.roll(3) > 0) {
    const guysTable = probable.createTableFromDef(guysTableDef);
    const mainGuy = guysTable.roll();

    var guyY = sceneMap[0].length - 2;
    if (guyY < 0) {
      guyY = 0;
    }

    var guyX = ~~(sceneMap.length/2);
    const guessDirection = probable.roll(2) === 0 ? 1 : -1;
    guyX += 2 * guessDirection;
    if (sceneMap[guyX][guyY] === '.') {
      sceneMap[guyX][guyY] = mainGuy;
    }
    // TODO: If that space is occupied, look around for nearby spaces.

    if (probable.roll(10) === 0) {
      // Extra guys!
      addEntitiesToMap({
        map: sceneMap,
        probable: probable,
        entityTableDef: guysTableDef,
        entityAddRoll: () => probable.roll(10) === 0,
        entityLimit: probable.rollDie(4)
      });
    }
  }

  return sceneMap;
}

module.exports = populateCaveScene;
