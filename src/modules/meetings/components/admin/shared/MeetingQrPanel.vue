<script setup>
import { fetchMeetingQrToken } from '@/modules/meetings/services/meetingService'
import { ref } from 'vue'

const props = defineProps({
  meetingId: { type: [String, Number], required: true },
})

const qrToken = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const loadQrToken = async () => {
  if (!props.meetingId) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await fetchMeetingQrToken(props.meetingId)

    qrToken.value = res.data?.qr_token || ''
  }
  catch (error) {
    console.error(error)
    errorMessage.value = 'Khong the tai ma QR cho cuoc hop nay.'
  }
  finally {
    isLoading.value = false
  }
}

const copyQrToken = async () => {
  if (!qrToken.value) return

  await navigator.clipboard.writeText(qrToken.value)
}
</script>

<template>
  <VCard
    elevation="0"
    class="mb-6"
    style="border-radius: 12px; border: 1px solid #f1f1f4; box-shadow: 0 4px 14px rgba(0,0,0,0.02) !important;"
  >
    <VCardItem class="pb-3 pt-5 px-5 border-b border-opacity-50">
      <div
        class="d-flex align-center gap-2 font-weight-bold text-uppercase"
        style="color: #475569; font-size: 0.95rem;"
      >
        <VIcon
          icon="tabler-qrcode"
          size="20"
          color="#10b981"
          class="rounded"
          style="background-color: #d1fae5; padding: 4px; box-sizing: content-box;"
        />
        QR Check-in
      </div>
    </VCardItem>
    <VCardText class="pa-5">
      <div class="text-body-2 mb-3 text-medium-emphasis">
        Lay ma QR token de hien thi cho dai bieu check-in.
      </div>

      <AppTextField
        :model-value="qrToken"
        readonly
        placeholder="Bam nut de tao / lay QR token"
        class="mb-3"
      />

      <VAlert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-3"
      >
        {{ errorMessage }}
      </VAlert>

      <div class="d-flex gap-3 flex-wrap">
        <VBtn
          color="primary"
          prepend-icon="tabler-refresh"
          :loading="isLoading"
          @click="loadQrToken"
        >
          Lay QR Token
        </VBtn>
        <VBtn
          v-if="qrToken"
          variant="outlined"
          prepend-icon="tabler-copy"
          @click="copyQrToken"
        >
          Sao chep
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
