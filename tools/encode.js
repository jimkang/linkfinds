var url = '';

if (process.argv.length > 2) {
  url = process.argv[2];
  logEncoding();
}
else {
  process.stdin.on('data', readStdIn);
  process.stdin.on('end', logEncoding);
}

function readStdIn(data) {
  url += data;
}

function logEncoding() {
  console.log(encodeURIComponent(url));
}
