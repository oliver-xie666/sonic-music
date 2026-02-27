import { get } from './client'

export const getRadioSongs = (card_id) => get('/top/card', { card_id })
