function saveWordForUser(opts, done) {
  var word;
  var username;
  var sublevelDb;

  if (opts) {
    word = opts.word;
    username = opts.username;
    sublevelDb = opts.sublevelDb;    
  } 

   var usedWords = sublevelDb.sublevel('used-words').sublevel(username);
   usedWords.put(word, new Date().toISOString(), done);
}

module.exports = saveWordForUser;
