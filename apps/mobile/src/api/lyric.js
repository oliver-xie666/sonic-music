import { get } from './client'

export const searchLyric = (hash) => get('/search/lyric', { hash })
export const getLyric = (id, accesskey) =>
  get('/lyric', { id, accesskey, fmt: 'krc', decode: true })
