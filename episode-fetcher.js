var config = require('./config/config');
var parser = require('./episode-parser');
var pad = require('pad-number');
var fs = require('fs-extra');
var path = require('path');
const TVDB = require('node-tvdb');

const tvdb = new TVDB(config.tvdb.apiKey);

const showDbFile = path.join(__dirname,config.episodeFetcher.dbFile);
console.log("reading db from: ", showDbFile);
var force = fs.readJsonSync(showDbFile, { throws: false }) || {};
console.log("read db");

// function forceWrap() {
//   if (!force) {
//     console.log("reading force");
//     force = await 
//     console.log("read force");
//   }
//   return force;
// }

function canonizeShowNameForForce(name) {
  return name.toLowerCase();
}

function saveForce() {
  fs.writeJson(showDbFile, force, { spaces: 2 });
}

async function getTvdbShow(fileData) {
  let canonicalShowName = canonizeShowNameForForce(fileData.show);
  let showId = force[canonicalShowName];
  if (showId){
    let show = await tvdb.getSeriesById(showId);
    if (!show)
      throw new Error(`Couldn't find show name ${fileData.show} with id ${showId}`);
    return show;
  } else {
    let series = await tvdb.getSeriesByName(fileData.show);
    if (series.length <= 0)
      throw new Error(`Couldn't find show name ${fileData.show}`);
    force[canonicalShowName] = series[0].id;
    saveForce();
    return series[0];
  }
}

async function getDataForFileName(filename) {
  let fileData = parser(filename);
  if (!fileData)
    throw new Error(`File is not an episode: ${filename}`);
  if (!fileData.show || fileData.season == undefined || fileData.episode == undefined)
    throw new Error(`Could not parse file name ${filename}: show='${fileData.show}' season=${fileData.season} && episode=${fileData.episode}`);

  let show = await getTvdbShow(fileData);
  let episodes = await tvdb.getEpisodesBySeriesId(show.id);
  if (episodes.length <= 0)
    throw new Error(`Couldn't find show name ${fileData.show}`);
  
  let someEpisode = episodes.find(ep => (ep.airedSeason === fileData.season && ep.airedEpisodeNumber === fileData.episode));
  if (!someEpisode)
    throw new Error(`Couldn't find episode season=${fileData.season} && episode=${fileData.episode}`);
  //someEpisode.showName = series.seriesName;
  return (({ absoluteNumber, airedSeason, airedEpisodeNumber, episodeName }) => (
    { 
      absoluteNumber, 
      season: airedSeason, 
      seasonPad: pad(airedSeason, 2), 
      episode: airedEpisodeNumber, 
      episodePad: pad(airedEpisodeNumber, 2), 
      episodeName, 
      ext: fileData.ext,
      showName: show.seriesName 
    }))(someEpisode);
}




module.exports = {getDataForFileName: getDataForFileName};
