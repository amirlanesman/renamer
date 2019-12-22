const request = require('request-promise')
const config = require('./config/config')

async function updateMediaLibrary() {
	console.log(`calling update media library url`)
  await request.post(config.kodi.updateUrl, {body: JSON.stringify({jsonrpc: "2.0", method: "VideoLibrary.Scan", id: "renamer"})})
}

async function refreshTvShow(tvshowid) {
	console.log(`calling refresh tvshow ${tvshowid} url`)
  await request.post(config.kodi.updateUrl, {
    body: JSON.stringify({
      jsonrpc: "2.0", 
      method: "VideoLibrary.RefreshTVShow", 
      id: "renamer",
      params: {
        refreshepisodes: true,
        tvshowid,
      }
    })
  })
}

async function getAllTvShows() {
	console.log(`calling get all tvshows url`)
  const res = await request.post(config.kodi.updateUrl, {
    body: JSON.stringify({
      jsonrpc: "2.0", 
      method: "VideoLibrary.RefreshTVShow", 
      id: "renamer",
      params: {
        refreshepisodes: true,
        tvshowid,
      }
    })
  })
  const {tvshows} = await res.json()
  return tvshows
}

async function refreshAllTvShows() {
  const tvshows = await getAllTvShows()
  if (tvshows) {
    for (let i = 0; i < tvshows.length; i++) {
      await refreshTvShow(tvshows[i].tvshowid)
    }
  } else {
    console.log(`Couldn't get tv shows`)
  }
}

module.exports = { updateMediaLibrary, refreshAllTvShows }