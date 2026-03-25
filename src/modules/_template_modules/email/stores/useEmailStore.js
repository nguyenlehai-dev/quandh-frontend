/**
 * Email Store (Pinia)
 */
import { defineStore } from 'pinia'
import { fetchEmails, deleteEmail, moveToFolder, markAsRead } from '../services/emailService'

export const useEmailStore = defineStore('email', {
  state: () => ({
    emails: [],
    totalCount: 0,
    isLoading: false,
    currentFolder: 'inbox',
    selectedEmails: [],
  }),

  getters: {
    unreadCount: state => state.emails.filter(e => !e.isRead).length,
    starredEmails: state => state.emails.filter(e => e.isStarred),
  },

  actions: {
    async fetchList() {
      this.isLoading = true
      try {
        const response = await fetchEmails({ folder: this.currentFolder })

        this.emails = response.data || response
        this.totalCount = response.meta?.total || this.emails.length
      }
      catch (error) {
        console.error('Failed to fetch emails:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeEmail(id) {
      await deleteEmail(id)
      await this.fetchList()
    },

    async moveEmail(id, folder) {
      await moveToFolder(id, folder)
      await this.fetchList()
    },

    async markSelectedAsRead() {
      if (this.selectedEmails.length) {
        await markAsRead(this.selectedEmails)
        await this.fetchList()
        this.selectedEmails = []
      }
    },

    changeFolder(folder) {
      this.currentFolder = folder
      this.fetchList()
    },
  },
})
