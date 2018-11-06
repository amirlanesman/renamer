var fs = require('fs-extra');
var app = require('../app');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var execConfig = require(argv.config || '../user/exec-config');
if (!execConfig) {
  console.log("could not find config file ", execConfigFile);
  return;
}
app.renameFiles(execConfig);