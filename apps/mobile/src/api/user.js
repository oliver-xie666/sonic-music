import { get, post } from './client'

export const login = (data) => post('/login', data)
export const getUserInfo = () => get('/user/info')
export const getUserDetail = () => get('/user/detail')
export const getUserPlaylists = (params) => get('/user/playlist', params)
export const getUserListen = (params) => get('/user/listen', { type: 1, ...params })
export const getUserFollow = (params) => get('/user/follow', params)
export const createPlaylist = (name, userid) => get('/playlist/add', { name, list_create_userid: userid })
