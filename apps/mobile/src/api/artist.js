import { get } from './client'

export const getArtistDetail = (params) => get('/artist/detail', params)
export const getArtistSongs = (params) => get('/artist/songs', params)
export const getArtistAlbums = (params) => get('/artist/albums', params)
export const getHotArtists = (params) => get('/artist/list', params)
