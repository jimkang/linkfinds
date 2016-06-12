const test = require('tape');
const PopulateScene = require('../populate-scene');
const range = require('d3-array').range;
const createProbable = require('probable').createProbable;
const seedrandom = require('seedrandom');

const testCases = [
  {
    name: "Don't occupy blocked-out spaces.",
    ctorOpts: {
      probable: createProbable({
        random: seedrandom('stay-out-of-blocked-spaces')
      })
    },
    opts: {
      sceneSize: [4, 3],
      occupiedSpots: [
        [1, 0],
        [2, 1],
        [2, 2],
        [3, 0],
        [3, 2]
      ]
    },
    expected:
    `.x.x
     t.x.
     t.xx`
  },
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, populateTest);

  function populateTest(t) {
    const populateScene = PopulateScene(testCase.ctorOpts);

    t.deepEqual(
      populateScene(testCase.opts),
      mapStringToArrays(testCase.expected),
      'Scene is populated correctly.'
    );
    t.end();
  }
}

function mapStringToArrays(mapString) {
  var arrays;

  var rowStrings = mapString.split('\n').map((r) => r.trim());
  if (rowStrings.length > 0) {
    var colCount = rowStrings[0].length;
    arrays = range(colCount).map(() => []);

    rowStrings.forEach(addColsToArrays);
  }

  return arrays;

  function addColsToArrays(rowString, rowNumber) {
    for (var colIndex = 0; colIndex < rowString.length; ++ colIndex) {
      arrays[colIndex][rowNumber] = rowString.charAt(colIndex);
    }
  }
}
