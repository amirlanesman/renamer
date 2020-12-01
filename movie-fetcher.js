var config = require("./config/config");
var IMDB = require("imdb-api");
const { parseVideo } = require("./video-parser");

const imdb = new IMDB.Client({ apiKey: config.imdb.apiKey });

async function getMovieData(fileData) {
  let results = await imdb.search({
    name: fileData.name,
    year: fileData.year,
    type: "movie",
  });

  if (!results || results.results.length < 1)
    throw new Error("No movies were found!");
  //console.log(results);
  return results.results[0];
}

async function getDataForFileName(filename) {
  let fileData = await parseVideo(filename);
  if (!fileData) throw new Error(`File is not a movie: ${filename}`);
  if (!fileData.name) {
    console.log(`Could not parse file name ${filename}. got:`, fileData);
    throw new Error(
      `Could not parse file name ${filename}: name='${fileData.show}' type=${fileData.type}`
    );
  }

  let movie = await getMovieData(fileData);
  return (({ title, year }) => ({
    title,
    year,
    ext: filename.split(".").pop(),
  }))(movie);
}

module.exports = { getDataForFileName };
