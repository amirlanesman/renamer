const request = require('request-promise')
const config = require('./config/config')

async function updateMediaLibrary() {
	console.log(`calling update media manager url`)
  await request.post(config.kodi.updateUrl, {body: JSON.stringify({jsonrpc: "2.0", method: "VideoLibrary.Scan", id: "renamer"})})
}

module.exports = { updateMediaLibrary }