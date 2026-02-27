import { get } from './client'

export const getRankList = () => get('/rank/list')
export const getRankAudio = (params) => get('/rank/audio', params)
