import { get } from './client'

export const search = (params) => get('/search', params)
export const getHotSearch = () => get('/search/hot')
