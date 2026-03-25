/**
 * useInvoice Composable
 */
import { createInvoice, updateInvoice } from '../services/invoiceService'
import { blankInvoice, blankInvoiceItem } from '../models/Invoice'

export function useInvoice() {
  const invoice = ref(structuredClone(blankInvoice))
  const isSubmitting = ref(false)
  const errors = ref({})

  const resetForm = () => {
    invoice.value = structuredClone(blankInvoice)
    errors.value = {}
  }

  const setInvoice = data => {
    invoice.value = structuredClone(data)
  }

  /** Thêm 1 dòng item */
  const addItem = () => {
    invoice.value.items.push(structuredClone(blankInvoiceItem))
  }

  /** Xóa 1 dòng item */
  const removeItem = index => {
    invoice.value.items.splice(index, 1)
    recalculate()
  }

  /** Tính lại tổng */
  const recalculate = () => {
    invoice.value.items.forEach(item => {
      item.total = item.quantity * item.unitPrice
    })

    invoice.value.subtotal = invoice.value.items.reduce((sum, item) => sum + item.total, 0)
    invoice.value.total = invoice.value.subtotal + invoice.value.tax - invoice.value.discount
  }

  const submitForm = async () => {
    isSubmitting.value = true
    errors.value = {}

    try {
      recalculate()

      const data = { ...invoice.value }
      let response

      if (data.id) {
        response = await updateInvoice(data.id, data)
      }
      else {
        response = await createInvoice(data)
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

  const isEditMode = computed(() => !!invoice.value.id)

  return {
    invoice,
    isSubmitting,
    errors,
    isEditMode,
    resetForm,
    setInvoice,
    addItem,
    removeItem,
    recalculate,
    submitForm,
  }
}
