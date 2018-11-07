require('dotenv').config(); // this loads the defined variables from .env

const config = {
  tvdb: { 
    apiKey: process.env.TVDB_API_KEY,
  },
  imdb: {
    apiKey: process.env.IMDB_API_KEY
  },
  episodeFetcher: {
    dbFile: process.env.EPISODE_FETCHER_DB_FILE || './user/episode-db.json'
  },
  logs: {
    moveLog: process.env.RENAMER_MOVE_LOG || './user/movelog.txt'
  }
};

module.exports = config;