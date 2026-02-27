import { get } from './client'

export const getPlaylistList = (params) => get('/top/playlist', { withsong: 0, ...params })
export const getPlaylistDetail = (params) => get('/playlist/detail', params)
export const getPlaylistTracks = (params) => get('/playlist/track/all', params)
export const getPlaylistTags = () => get('/playlist/tags')
