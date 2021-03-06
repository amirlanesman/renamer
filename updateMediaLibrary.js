const request = require('request-promise')
const config = require('./config/config')

async function updateMediaLibrary() {
  console.log(`calling update media library url`)
  await request.post(config.kodi.updateUrl, { body: JSON.stringify({ jsonrpc: "2.0", method: "VideoLibrary.Scan", id: "renamer" }) })
}

async function cleanVideoLibrary() {
  console.log(`calling clean video library url`)
  await request.post(config.kodi.updateUrl, { body: JSON.stringify({ jsonrpc: "2.0", method: "VideoLibrary.Clean", id: "renamer" }) })
}

async function refreshTvShow(tvshow) {
  console.log(`calling refresh tvshow ${JSON.stringify(tvshow)} url`)
  await request.post(config.kodi.updateUrl, {
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "VideoLibrary.RefreshTVShow",
      id: "renamer",
      params: {
        refreshepisodes: true,
        tvshowid: tvshow.tvshowid,
      }
    })
  })
}

async function getAllTvShows() {
  console.log(`calling get all tvshows url`)
  const res = await request.post(config.kodi.updateUrl, {
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "VideoLibrary.GetTVShows",
      id: "renamer",
    })
  })
  const parsed = JSON.parse(res)
  const { tvshows } = parsed.result
  return tvshows
}

async function refreshAllTvShows() {
  const tvshows = await getAllTvShows()
  if (tvshows) {
    for (let i = 0; i < tvshows.length; i++) {
      await refreshTvShow(tvshows[i])
    }
  } else {
    console.log(`Couldn't get tv shows`)
  }
}

module.exports = { updateMediaLibrary, refreshAllTvShows, cleanVideoLibrary }