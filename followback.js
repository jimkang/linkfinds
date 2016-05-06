var config = require('./config');
var filteredFollowback = require('filtered-followback');

filteredFollowback(
  {
    twitterCreds: config.twitter,
    neverUnfollow: [
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
