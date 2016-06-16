function addEntitiesToMap(opts) {
  var map;
  var probable;
  var entityTableDef;
  var entityAddRoll;
  var entityLimit;

  if (opts) {
    map = opts.map;
    probable = opts.probable;
    entityTableDef = opts.entityTableDef;
    entityAddRoll = opts.entityAddRoll;
    entityLimit = opts.entityLimit;
  }

  var entityCount = 0;

  const table = probable.createTableFromDef(entityTableDef);

  for (var x = 0; x < map.length; ++x) {
    for (var y = 0; y < map[x].length; ++y) {
      if (!isNaN(entityLimit) && entityCount > entityLimit) {
        return;
      }

      if (map[x][y] === '.' && entityAddRoll()) {
        map[x][y] = table.roll();
        entityCount += 1;
      }      
    }
  }
}

module.exports = addEntitiesToMap;
