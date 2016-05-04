var config = require('./config');
var callNextTick = require('call-next-tick');
var betterKnowATweet = require('better-know-a-tweet');
var async = require('async');
var behavior = require('./behavior');
var createIsCool = require('iscool');
var canIChimeIn = require('can-i-chime-in')();
var iscool = createIsCool();
var username = behavior.twitterUsername;
var getImagesFromTweet = require('get-images-from-tweet');

// Passes an error if you should not reply.
function shouldReplyToTweet(opts, done) {
  var tweet;
  var lastReplyDates;
  var waitingPeriod = behavior.hoursToWaitBetweenRepliesToSameUser;

  if (opts) {
    tweet = opts.tweet;
    lastReplyDates = opts.lastReplyDates;
  }

  if (tweet.user.screen_name === username) {
    callNextTick(done, new Error('Subject tweet is own tweet.'));
    return;
  }

  // TODO: This should go in canIChimeIn.
  if (betterKnowATweet.isRetweetOfUser(username, tweet)) {
    callNextTick(done, new Error('Subject tweet is own retweet.'));
    return;
  }

  var words = tweet.text.split(/[ ":.,;!?#]/);
  if (!words.every(iscool)) {
    callNextTick(done, new Error('Not cool to reply to tweet.'));
    return;
  }

  if (!canIChimeIn(tweet.text)) {
    callNextTick(done, new Error('Cannot chime in on this tweet.'));
    return;    
  }

  // TODO: Move this up, possibly.
  var imageURLs = getImagesFromTweet(tweet);
  if (imageURLs.length < 1) {
    callNextTick(done, new Error('No reason to reply: No images in tweet.'));
    return;
  }

  async.waterfall(
    [
      goFindLastReplyDate,
      replyDateWasNotTooRecent
    ],
    done
  );

  function goFindLastReplyDate(done) {
    findLastReplyDateForUser(tweet, done);
  }

  function findLastReplyDateForUser(tweet, done) {
    console.log('Get:', tweet.user.id_str);
    lastReplyDates.get(tweet.user.id_str, passLastReplyDate);

    function passLastReplyDate(error, dateString) {
      var date;
      // Don't pass on the error – `whenWasUserLastRepliedTo` can't find a
      // key, it returns a NotFoundError. For us, that's expected.
      if (error && error.type === 'NotFoundError') {
        error = null;
        date = new Date(0);
      }
      else {
        date = new Date(dateString);
      }
      done(error, tweet, date);
    }
  }

  function replyDateWasNotTooRecent(tweet, lastReplyDate, done) {
    var hoursElapsed = (Date.now() - lastReplyDate.getTime())/(60 * 60 * 1000);

    if (hoursElapsed >= waitingPeriod) {
      done();
    }
    else {
      done(new Error(
        `Replied ${hoursElapsed} hours ago to ${tweet.user.screen_name}.
        Need at least ${waitingPeriod} to pass.`
      ));
    }
  }
}

module.exports = shouldReplyToTweet;
