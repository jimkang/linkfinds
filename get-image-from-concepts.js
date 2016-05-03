var gis = require('g-i-s');
var async = require('async');
var probable = require('probable');
var pickFirstGoodURL = require('pick-first-good-url');
var callNextTick = require('call-next-tick');

function getImageFromConcepts(concepts, allDone) {
  var result;
  async.someSeries(concepts, searchGIS, passResult);

  function searchGIS(concept, done) {
    var gisOpts = {
      searchTerm: concept,
      queryStringAddition: '&tbs=ic:trans'
    };
    gis(gisOpts, checkGISResults);

    function checkGISResults(error, results) {
      if (error) {
        done(error, false);
      }
      else if (results.length < 1) {
        done(null, false);
      }
      else {
        var imageURLs = probable.shuffle(results.slice(0, 10));
        var pickOpts = {
          urls: imageURLs,
          responseChecker: isImageMIMEType
        };
        pickFirstGoodURL(pickOpts, saveGoodURL);        
        
      }
    }

    function saveGoodURL(error, goodURL) {
      if (error) {
        done(error);
      }
      else if (!goodURL) {
        done(null, false);
      }
      else {
        result = {
          concept: concept,
          imgurl: goodURL 
        };
        done(null, true);
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
  callNextTick(
    done, null, response.headers['content-type'].indexOf('image/') === 0
  );
}

module.exports = getImageFromConcepts;
