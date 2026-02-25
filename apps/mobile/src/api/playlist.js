import { get } from './client'

export const getPlaylistList = (params) => get('/playlist/list', params)
export const getPlaylistDetail = (params) => get('/playlist/detail', params)
export const getPlaylistTracks = (params) => get('/playlist/track/all', params)
