const config = require('./config/config')
const spawn = require('child-process-promise').spawn;
 
async function runMediaManager() {
  for (const args of config.mediaManager.args) {
    await runMediaManagerInstance(config.mediaManager.command, args)
  }
}

async function runMediaManagerInstance(command, args) {
  console.log(`spawning media manager:`, command, args);
  const promise = spawn(command, args);
   
  const childProcess = promise.childProcess;

  console.log('[spawn] mediaManager.pid: ', childProcess.pid);
  childProcess.stdout.on('data', function (data) {
      console.log('[spawn] mediaManager stdout: ', data.toString());
  });
  childProcess.stderr.on('data', function (data) {
      console.log('[spawn] mediaManager stderr: ', data.toString());
  });
   
  await promise
  console.log('[spawn] done!')
}

module.exports = {runMediaManager}