import { get } from './client'

export const getRecommend = () => get('/everyday/recommend')
export const getSongUrl = (hash, quality) => get('/song/url', { hash, quality })
export const getSongPrivilege = (hash) => get('/song/privilege', { hash })
export const getSongDetail = (hash) => get('/song/detail', { hash })
