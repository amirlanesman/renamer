{
  "path": "/Path/To/Temp/Dir",
  "filter": "\\.(mkv|mp4|avi|srt)$",
  "fetchers": {
    "series" : {
      "newPath": "/Path/To/Tv/Shows/{showName}/S{seasonPad}/{showName} S{seasonPad}E{episodePad} - {episodeName}.{ext}",
      "fetcher": "./episode-fetcher"    
    },
    "movie" : {
      "newPath": "/Path/To/Movies/{title} ({year})/{title}.{ext}",
      "fetcher": "./movie-fetcher"    
    }    
  }
}