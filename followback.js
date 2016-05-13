var config = require('./config');
var filteredFollowback = require('filtered-followback');

filteredFollowback(
  {
    twitterCreds: config.twitter,
    neverUnfollow: [
      3315220465,
      1959974761,
      709106291147415600,
      2288902454,
      3293239484,
      3305536529,
      3317221923,
      3352995195,
      3413544490,
      3440186897,
      3698211443,
      4206370581,
      4888652848,
      711040770187219000,
      2907425432,
      3158440414,
      4872994509,
      4372938635,
      123087976,
      2866769301,
      2566358196,
      129586119,
      3238030304,
      3193947078
    ],
    blacklist: [
    ]
  },
  reportResults
);

function reportResults(error, followed, unfollowed, filteredOut) {
  if (error) {
    console.log(error);
  }
  console.log('Followed:', followed);
  console.log('Unfollowed:', unfollowed);
  console.log('Filtered out:', filteredOut);
}
