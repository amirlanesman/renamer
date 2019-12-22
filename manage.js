const argv = require('minimist')(process.argv.slice(2));
const sync = require('./sync')
const runMediaManager = require('./runMediaManager').runMediaManager
const refreshAllTvShows = require('./updateMediaLibrary').refreshAllTvShows

async function main() {
  console.log(`Starting manage of library`)
  const execConfig = require(argv.config || './user/exec-config');
  const path = argv.path
  if (!execConfig) {
    console.log("could not find config file ", execConfig);
    return;
  }
  await sync.startSync(execConfig.syncFile)
  // await runMediaManager()
  await refreshAllTvShows()
  sync.stopSync()
}

main().then(() => console.log('Done!'), (error) => {
  console.error('Failed!', error)
  sync.stopSync()
})