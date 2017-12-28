var probable = require('probable');

var prefixTable = probable.createTableFromSizes([
  [5, '♪'],
  [3, '♫'],
  [2, '🎵'],
  [2, '♬'],
  [1, '𝄢'],
  [2, '𝄞']
]);

var suffixTable = probable.createTableFromSizes([[3, '♩'], [5, '♪'], [1, '𝄑']]);

function dooDooDooDoo() {
  return prefixTable.roll() + ' DOO DOO DOO DOO! ' + suffixTable.roll();
}

module.exports = dooDooDooDoo;
