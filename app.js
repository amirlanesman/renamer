const config = require('./config/config');
var path = require('path');
var format = require("string-template");
var fs = require('fs-extra');
var path = require('path');
var parseVideo = require("video-name-parser");
var sanitize = require("sanitize-filename");
var os = require('os')

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

function getLogLine(log) {
  return new Date().toLocaleString() + "\t" + log + os.EOL;
}

function logToFile(log) {
  fs.ensureDir(path.dirname(config.logs.moveLog), (err) => {
    if (!err) {
      fs.ensureFile(config.logs.moveLog, (err1) => {
        if (!err1) {
          fs.appendFile(config.logs.moveLog, getLogLine(log), () => { });
        }
      });
    }
  });
}

function repathFile(oldNewFile, callback) {
  let log = `Moving '${oldNewFile.oldPath}' => '${oldNewFile.newPath}'`;
  console.log(log);
  logToFile(log);
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

function sanitizeData(data) {
  let obj = {}
  Object.keys(data).forEach(function(key) {
    if (data[key] && data[key].replace)
      obj[key] = sanitize(data[key], {replacement: "-"});
    else
      obj[key]=data[key];
  });
  return obj;
}

function sanitizePath(filePath){
  let arr = filePath.split(path.sep);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = sanitize(arr[i], {replacement: "-"});
  }
  let sanitizedPath = path.join.apply(null, arr);
  if (filePath.startsWith(path.sep))
    sanitizedPath = path.sep + sanitizedPath;
  if (filePath.endsWith(path.sep))
    sanitizedPath = sanitizedPath + path.sep;
  return sanitizedPath;
}

async function handleFilename(fetchers, oldPath) {
  try {
    let filename = path.basename(oldPath);
    let type = parseVideo(filename).type;
    let fetcher = fetchers[type];
    if (fetcher) {
      let dataForFileName = await fetcher.fetcher.getDataForFileName(filename);
      let newPath = format(fetcher.newPath, dataForFileName);
      return {oldPath: oldPath, newPath: sanitizePath(newPath)}; 
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
