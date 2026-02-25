import { get, post } from './client'

export const login = (data) => post('/login', data)
export const getUserInfo = () => get('/user/info')
export const getUserPlaylists = (params) => get('/user/playlist', params)
