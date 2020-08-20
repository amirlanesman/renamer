const fileMover = require('./file-mover');
const argv = require('minimist')(process.argv.slice(2));
const sync = require('./sync')
const runMediaManager = require('./runMediaManager').runMediaManager
const updateMediaLibrary = require('./updateMediaLibrary').updateMediaLibrary

async function main() {
  console.log(`Starting rename`)
  const execConfig = require(argv.config || './user/exec-config');
  const path = argv.path
  const keepFiles = !argv.discardFiles
  const forcedType = argv.forceType
  if (!execConfig) {
    console.log("could not find config file ", execConfig);
    return;
  }
  if (!path) {
    console.log("missing path to process");
    return;
  }
  await sync.startSync(execConfig.syncFile)
  await fileMover.processFiles(path, execConfig, keepFiles, forcedType)
  console.log('moved files, starting media manager')
  await runMediaManager()
  console.log('finished media manager, starting library update')
  await updateMediaLibrary()
  console.log('finished library update')
  sync.stopSync()
}

main().then(() => console.log('Done!'), (error) => {
  console.error('Failed!', error)
  sync.stopSync()
})