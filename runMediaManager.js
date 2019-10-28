const config = require('./config/config')
const spawn = require('child-process-promise').spawn;
 
async function runMediaManager() {
  console.log(`spawning media manager`)
  const promise = spawn(config.mediaManager.command, config.mediaManager.args);
   
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