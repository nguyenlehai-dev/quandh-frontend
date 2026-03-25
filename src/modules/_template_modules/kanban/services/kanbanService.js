/**
 * Kanban Service
 */
import { API_BASE } from '../configs'

export const fetchBoards = () => {
  return $api(API_BASE)
}

export const fetchBoard = id => {
  return $api(`${API_BASE}/${id}`)
}

export const createBoard = data => {
  return $api(API_BASE, { method: 'POST', body: data })
}

export const updateBoard = (id, data) => {
  return $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
}

export const deleteBoard = id => {
  return $api(`${API_BASE}/${id}`, { method: 'DELETE' })
}

export const createCard = (boardId, columnId, data) => {
  return $api(`${API_BASE}/${boardId}/columns/${columnId}/cards`, { method: 'POST', body: data })
}

export const updateCard = (boardId, cardId, data) => {
  return $api(`${API_BASE}/${boardId}/cards/${cardId}`, { method: 'PUT', body: data })
}

export const deleteCard = (boardId, cardId) => {
  return $api(`${API_BASE}/${boardId}/cards/${cardId}`, { method: 'DELETE' })
}

export const moveCard = (boardId, cardId, data) => {
  return $api(`${API_BASE}/${boardId}/cards/${cardId}/move`, { method: 'POST', body: data })
}
