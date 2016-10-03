var gis = require('g-i-s');
var async = require('async');
var probable = require('probable');
var pickFirstGoodURL = require('pick-first-good-url');
var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
var findWhere = require('lodash.findwhere');
var behavior = require('./behavior');
var pathExists = require('object-path-exists');

var nonTextImageTypeTable = probable.createTableFromDef({
  '0-5': 'photo',
  '6-6': 'clipart',
  '7-7': 'lineart'
});

var skipDomains = [
  'deviantart.net',
  'deviantart.com',
  'tumblr.com'
];

function getImageFromConcepts(concepts, allDone) {
  var result;
  async.someSeries(concepts, searchGIS, passResult);

  function searchGIS(concept, done) {
    var gisOpts = {
      searchTerm: concept,
      queryStringAddition: '&safe=active&tbs=ic:trans'
    };

    if (probable.roll(4) > 0) {
      // Try to reduce the amount of text-in-image results.
      gisOpts.queryStringAddition += ',itp:' + nonTextImageTypeTable.roll();
    }

    gis(gisOpts, checkGISResults);

    function checkGISResults(error, results) {
      if (error) {
        done(error, false);
      }
      else if (results.length < 1) {
        done(null, false);
      }
      else {
        var imageResults = probable.shuffle(
          results.slice(0, behavior.numberOfImageResultToConsider)
        );
        var pickOpts = {
          urls: pluck(imageResults, 'url').filter(domainIsOK),
          responseChecker: isImageMIMEType
        };

        pickFirstGoodURL(pickOpts, saveGoodURL);        
      }

      function saveGoodURL(error, goodURL) {
        if (error) {
          done(error);
        }
        else if (!goodURL) {
          done(null, false);
        }
        else {
          var goodGISResult = findWhere(imageResults, {url: goodURL});
          result = {
            concept: concept,
            imgurl: goodURL,
            width: goodGISResult.width,
            height: goodGISResult.height
          };
          done(null, true);
        }
      }
    }
  }

  function passResult(error, found) {
    if (error) {
      allDone(error);
    }
    else if (!found) {
      allDone(new Error('Could not find image for concepts.'));
    }
    else {
      allDone(null, result);
    }
  }
}

function isImageMIMEType(response, done) {
  if (pathExists(response, ['headers', 'content-type'])) {
    callNextTick(
      done, null, response.headers['content-type'].indexOf('image/') === 0
    );
  }
  else {
    callNextTick(done, null, false);
  }
}

function domainIsOK(url) {
  return skipDomains.every(skipDomainIsNotInURL);

  function skipDomainIsNotInURL(skipDomain) {
    return url.indexOf(skipDomain) === -1;
  }
}

module.exports = getImageFromConcepts;
