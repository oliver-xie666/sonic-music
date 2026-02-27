import { get } from './client'

export const getPlaylistList = (params) => get('/top/playlist', params)
export const getPlaylistDetail = (params) => get('/playlist/detail', params)
export const getPlaylistTracks = (params) => get('/playlist/track/all', params)
