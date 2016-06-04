var test = require('tape');
var GetLinkFindingImage = require('../../get-link-finding-image');
var fs = require('fs');
const config = require('../../test-config');

const getLinkFindingImage = GetLinkFindingImage({
  config: config
});


var imageCounter = 0;

var testCases = [
  {
    name: 'valid-image',
    imageConcept: {
      imgurl: 'http://assets.wholefoodsmarket.com/www/blogs/whole-story/post-images/strawberry_geometric.png',
      concept: 'test'
    },
    expected: {}
  },
  {
    name: 'animated-gif',
    imageConcept: {
      imgurl: 'https://67.media.tumblr.com/8df6cc88c7cdb1aab0ef8749e91b983a/tumblr_inline_o66spiQOEh1rjllea_540.gif',
      concept: 'test'
    },
    expected: {}
  },
  {
    name: 'Blank https://twitter.com/linkfinds/status/730341827883192320',
    imageConcept: {
      imgurl: 'http://vignette2.wikia.nocookie.net/p__/images/a/a6/Mort_Goldman.png/revision/latest?cb=20150524125305&path-prefix=protagonist',
      concept: 'test'
    }
  }
];

console.log('You need to watch processes to make sure there\'s no more than maxSimultaneousWebshots pairs of phantomjs processes during the simultaneous tests!');
test('Simultaneous request test', testSimultaneous);

function testSimultaneous(t) {
  var multiplier = 3;
  for (var i = 0; i < multiplier; ++i) {
    testCases.forEach(startGet);
  }
  
  var numberOfResults = 0;

  function count() {
    numberOfResults += 1;
    if (numberOfResults === testCases.length * multiplier) {
      t.end();
    }
  }

  function startGet(testCase) {
    getLinkFindingImage(testCase.imageConcept, accountForReturn);

    function accountForReturn(error, linkResult) {
      t.ok(!error, 'No error while getting Link-finding image.');
      if (error) {
        console.log(error, error.stack);
      }
      validateResult(linkResult, testCase, 'simultaneous', count);
    }
  }

  function validateResult(linkResult, testCase, prefix, done) {
    t.equal(linkResult.concept, testCase.imageConcept.concept, 'Result has a concept.');
    t.ok(linkResult.imageStream, 'Result has an imageStream.');

    var filename = 'image-output/' + prefix + '-' + testCase.name.replace(/[\s\:\/]/g, '-') +
      '-' + imageCounter + '.png';
    imageCounter += 1;
    console.log('Starting write of', filename);
    console.log('You need to use your human eyes to visually inspect it when it\'s done.');
    // fs.writeFile(filename, linkResult.base64Image, 'base64', done);

    linkResult.imageStream.on('error', checkError);
    linkResult.imageStream.on('end', count);
    linkResult.imageStream.pipe(fs.createWriteStream(filename));
  }

  function checkError(error) {
    t.fail('No error while getting image.');
    if (error) {
      console.log(error, error.stack);
    }
  }
}
