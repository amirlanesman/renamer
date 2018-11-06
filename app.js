const config = require('./config/config');
var path = require('path');
var format = require("string-template");
var fs = require('fs-extra');
var path = require('path');
var parseVideo = require("video-name-parser");

//var fileDataHandler = require('');

function fromDir(startPath,filter,callback){
    if (!fs.existsSync(startPath)){
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) 
          callback(filename);
    };
};

function getFiles(path, filter, fileCallback) {
  fromDir(path, filter, fileCallback);
}

function repathFile(oldNewFile, callback) {
  console.log(`Moving '${oldNewFile.oldPath}' => '${oldNewFile.newPath}'`);
  let dir = path.dirname(oldNewFile.newPath);
  fs.ensureDir(dir, (err) => {
    if (err)
      callback(err);
    fs.rename(oldNewFile.oldPath, oldNewFile.newPath, callback);
  });
}

function getFetchers(config) {
  let fetchers = {};
  Object.keys(config.fetchers).forEach(function(key) {
    fetchers[key] = {
      newPath: config.fetchers[key].newPath,
      fetcher: require(config.fetchers[key].fetcher)
    };
  });
  return fetchers;
}

function renameFiles(config) {
  var fetchers = getFetchers(config);
  //var promises = [];
  getFiles(config.path, new RegExp(config.filter, 'i'), (filename) => {
    handleFilename(fetchers, filename).then((result) => {
      if (result) 
        repathFile(result, (err) => { if (err) console.log(`Couldn't move file`, result, 'because of', err); });
    });
  });
  // Promise.all(promises).then((results) => {
  //   results.filter((result) => (result !== undefined)).forEach(repathFile);
  // });
}

async function handleFilename(fetchers, oldPath) {
  try {
    let filename = path.basename(oldPath);
    let type = parseVideo(filename).type;
    let fetcher = fetchers[type];
    if (fetcher) {
      let dataForFileName = await fetcher.fetcher.getDataForFileName(filename);
      let newPath = format(fetcher.newPath, dataForFileName);
      return {oldPath: oldPath, newPath: newPath}; 
    }
  } catch (error) {
    console.log(`Couldn't get new path for file: ${oldPath}`);
    console.log(error);
  }
  return null;
}

// var userConfig = getConfig();
// renameFiles(userConfig);

module.exports = {renameFiles: renameFiles};
