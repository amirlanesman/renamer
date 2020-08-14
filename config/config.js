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
  },
  fileMover: {
    processedFilesDbFile: process.env.PROCESSED_FILES_DB_FILE || './user/processed_files.txt'
  },
  sync: {
    syncBackoffCheckMs: 3000,
    syncBackoffMs: 1000,
  },
  mediaManager: {
    command: process.env.MEDIA_MANAGER_COMMAND,
    args: process.env.MEDIA_MANAGER_ARGS ? [process.env.MEDIA_MANAGER_ARGS.split(' ')] : ['-update', '-scrapeUnscraped']
  },
  kodi: {
    updateUrl:  process.env.KODI_UPDATE_URL || 'http://192.168.0.183:8088/jsonrpc'
  }
}

module.exports = config;