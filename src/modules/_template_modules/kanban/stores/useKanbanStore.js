/**
 * Kanban Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchBoards, deleteBoard, deleteCard, moveCard } from '../services/kanbanService'

export const useKanbanStore = defineStore('kanban', {
  state: () => ({
    boards: [],
    currentBoard: null,
    isLoading: false,
  }),

  actions: {
    async fetchList() {
      this.isLoading = true
      try {
        this.boards = await fetchBoards()
      }
      catch (error) {
        console.error('Failed to fetch boards:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeBoard(id) {
      await deleteBoard(id)
      await this.fetchList()
    },

    async removeCard(boardId, cardId) {
      await deleteCard(boardId, cardId)
      await this.fetchList()
    },

    async moveCardToColumn(boardId, cardId, targetColumnId, order) {
      await moveCard(boardId, cardId, { columnId: targetColumnId, order })
    },

    setCurrentBoard(board) {
      this.currentBoard = board
    },
  },
})
