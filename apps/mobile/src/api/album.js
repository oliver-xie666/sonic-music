import { get } from './client'

export const getAlbumDetail = (params) => get('/album/detail', params)
export const getAlbumSongs = (params) => get('/album/songs', params)
export const getNewAlbums = (params) => get('/album/new', params)
