import { get } from './client'

export const getRankingList = () => get('/ranking/list')
export const getRankingDetail = (params) => get('/ranking/detail', params)
