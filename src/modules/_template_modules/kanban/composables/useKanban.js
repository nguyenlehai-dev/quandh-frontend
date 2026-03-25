/**
 * useKanban Composable
 */
import { createCard, updateCard } from '../services/kanbanService'
import { blankCard } from '../models/Board'

export function useKanban() {
  const card = ref(structuredClone(blankCard))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    card.value = structuredClone(blankCard)
    errors.value = {}
  }

  const setCard = data => {
    card.value = structuredClone(data)
  }

  const submitCard = async (boardId, columnId) => {
    isSubmitting.value = true
    errors.value = {}

    try {
      const data = { ...card.value }
      let response

      if (data.id) {
        response = await updateCard(boardId, data.id, data)
      }
      else {
        response = await createCard(boardId, columnId, data)
      }

      resetForm()

      return response
    }
    catch (error) {
      if (error?.response?.status === 422) {
        errors.value = error.response._data?.errors || {}
      }

      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  const isEditMode = computed(() => !!card.value.id)

  return {
    card,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setCard,
    submitCard,
  }
}
