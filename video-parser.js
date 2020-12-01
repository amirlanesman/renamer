// var config = require('./config/config');
// var IMDB = require('imdb-api');
var parseVideoNode = require("video-name-parser");
// const exec = require("promise-exec");
// const exec = require('util').promisify(require('child_process').exec)
const exec = require('child-process-promise').exec;

async function parseVideo(filename) {
  const res = await exec(`guessit -n -j "${filename}"`);
  // console.log('guessit returned:\n>>>>'+ res.stdout + '<<<<');
  let data = JSON.parse(res.stdout);
  return {
    ...data,
    show: data.title,
    name: data.title,
    ext: data.container,
    type: data.type === 'episode' ? 'series' : data.type,
  };
  //   var parseVideo: (filePath: any, options: any) => {
  //     season: number;
  //     episode: number[];
  //     diskNumber: number;
  //     type: string;
  //     aired: any;
  //     name: any;
  //     imdb_id: any;
  //     tag: any[];
  // }
}

module.exports = { parseVideo };
