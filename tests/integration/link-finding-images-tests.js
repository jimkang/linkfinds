var test = require('tape');
var getLinkFindingImage = require('../../get-link-finding-image');
var fs = require('fs');

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

for (var i = 0; i < 100; ++i) {
  testCases.forEach(runTest);
}

function runTest(testCase) {
  test(testCase.name, testLinkFindingImage);

  function testLinkFindingImage(t) {
    getLinkFindingImage(testCase.imageConcept, checkFinding);

    function checkFinding(error, linkResult) {
      t.ok(!error, 'No error while getting Link-finding image.');
      if (error) {
        console.log(error, error.stack);
      }
      t.equal(linkResult.concept, testCase.imageConcept.concept, 'Result has a concept.');
      t.ok(linkResult.base64Image.length > 0, 'Result has a base64Image string.');
      var filename = 'image-output/test-' + testCase.name.replace(/[\s\:\/]/g, '-') +
        '-' + imageCounter + '.png';
      imageCounter += 1;
      console.log('Writing out', filename);
      console.log('You need to use your human eyes to visually inspect it.');
      fs.writeFile(filename, linkResult.base64Image, 'base64', t.end);
    }
  }
}
