const config = require('./config/config');
var path = require('path');
var format = require("string-template");
var fs = require('fs-extra');
var path = require('path');
var parseVideo = require("video-name-parser");
var sanitize = require("sanitize-filename");

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

function sanitizePath(filePath){
  let arr = filePath.split(path.sep);
  for (let i = 1; i < arr.length; i++) {
    arr[i] = sanitize(arr[i], {replacement: "-"});
  }
  let sanitizedPath = path.join.apply(null, arr);
  if (filePath.startsWith(path.sep))
    sanitizedPath = path.sep + sanitizedPath;
  if (filePath.endsWith(path.sep))
    sanitizedPath = sanitizedPath + path.sep;
  return sanitizedPath;
}

async function getFileData(fetchers, filename, forcedType) {
  try {
    let type = forcedType || parseVideo(filename).type;
    let fetcher = fetchers[type];
    console.log('got type and forced type:', {forcedType, type}, fetchers[type]);
    if (fetcher) {
      let dataForFileName = await fetcher.fetcher.getDataForFileName(filename);
      let newPath = format(fetcher.newPath, dataForFileName);
      return sanitizePath(newPath)
    }
  } catch (error) {
    console.log(`Couldn't get new path for file: ${filename}`);
    console.log(error);
  }
}

// var userConfig = getConfig();
// renameFiles(userConfig);
// var fetchers = getFetchers(config);

module.exports = {getFileData, getFetchers};
